package portals

import (
	"appengine"
	"appengine/datastore"

	"encoding/json"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/plus/v1"
	"io/ioutil"
	"net/http"
	"path/filepath"
	"strings"
	"time"
)

//TODO: on error do something... :S
var hmacTestKey []byte

func init() {
	var err error
	absPath, _ := filepath.Abs("../../hmactest")
	hmacTestKey, err = ioutil.ReadFile(absPath)
	if err != nil {
		panic("No puedo leer el archivo hmactest2")
	}
}

type SattelizerData struct {
	ClientId    string `json:"clientId"`
	Code        string `json:"code"`
	RedirectUri string `json:"redirectUri"`
}

var config = &oauth2.Config{
	ClientID:     "164620448986-olal315lm7t73p7qgp47isa5jl31le8r.apps.googleusercontent.com", // from https://code.google.com/apis/console/
	ClientSecret: "LHfl8sX9PzLf4bxVLjLhSTP9",                                                 // from https://code.google.com/apis/console/
	Endpoint:     google.Endpoint,
	Scopes:       []string{plus.PlusLoginScope},
}

type User struct {
	Id        string
	Email     string
	Name      string `json:"name"`
	Allowed   bool
	AgentName string
}

func Authenticate(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	defer r.Body.Close()
	body, _ := ioutil.ReadAll(r.Body)
	var sattData SattelizerData
	err := json.Unmarshal(body, &sattData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	config.RedirectURL = sattData.RedirectUri
	token, err := config.Exchange(c, sattData.Code)
	client := config.Client(c, token)
	plusService, err := plus.New(client)
	person, err := plusService.People.Get("me").Do()

	//Create user in DB if not exists
	var user User
	key := datastore.NewKey(c, "User", person.Id, 0, nil)
	if err := datastore.Get(c, key, &user); err != nil {
		//User doesn't exist, create
		user.Name = person.DisplayName
		user.Allowed = false
		if person.Emails != nil && person.Emails[0].Type == "account" {
			user.Email = person.Emails[0].Value
		}
		user.Id = person.Id
		key, err = datastore.Put(c, key, &user)
	}
	jottoken := jwt.New(jwt.GetSigningMethod("HS256"))
	jottoken.Claims["id"] = person.Id
	jottoken.Claims["name"] = person.DisplayName
	jottoken.Claims["allowed"] = user.Allowed
	jottoken.Claims["imageUrl"] = person.Image.Url
	jottoken.Claims["exp"] = time.Now().Add(time.Hour * 72).Unix()
	tokenString, err := jottoken.SignedString(hmacTestKey)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Fprintf(w, "{\"token\":\"%s\"}", tokenString)
}

func AuthHandler(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, ":!", http.StatusForbidden)
			return
		}
		parts := strings.Split(authHeader, " ")
		if err := Verify(parts[1], r); err != nil {
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func Verify(myToken string, r *http.Request) error {
	c := appengine.NewContext(r)
	parts := strings.Split(myToken, ".")
	method := jwt.GetSigningMethod("HS256")
	err := method.Verify(strings.Join(parts[0:2], "."), parts[2], hmacTestKey)
	if err != nil {
		c.Infof(">>>%s", err)
		return err
	}
	token, err := jwt.Parse(myToken, func(token *jwt.Token) (interface{}, error) {
		return hmacTestKey, nil
	})
	if err != nil {
		c.Infof("1%s", err)
		return err
	}
	var user User
	key := datastore.NewKey(c, "User", token.Claims["id"].(string), 0, nil)
	if err := datastore.Get(c, key, &user); err != nil {
		return err
	}
	if !user.Allowed {
		return fmt.Errorf("user %s not allowed or smurf", user.Name)
	}
	c.Infof(">>>%s", user)
	return err
}
