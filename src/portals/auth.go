package portals

import (
	"appengine"
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

	jottoken := jwt.New(jwt.GetSigningMethod("HS256"))
	jottoken.Claims["name"] = person.DisplayName
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
		if err := Verify(parts[1]); err != nil {
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func Verify(myToken string) error {
	parts := strings.Split(myToken, ".")
	method := jwt.GetSigningMethod("HS256")
	err := method.Verify(strings.Join(parts[0:2], "."), parts[2], hmacTestKey)
	return err
}
