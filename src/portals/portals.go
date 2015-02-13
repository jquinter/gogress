package portals

import (
	"appengine"
	"appengine/datastore"
	"appengine/search"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"io/ioutil"
	"net/http"
	"strings"
	"unicode/utf8"
)

type Portal struct {
	Id     string   `json:"id"`
	Title  string   `json:"title"`
	Lat    float32  `json:"lat"`
	Lon    float32  `json:"lon"`
	Image  string   `json:"image"`
	Keys   []Key    `json:"keys" datastore:",noindex"`
	Labels []string `json:"labels"`
	TelefoniaDisponible  string   `json:"TelefoniaDisponible"`
	Horarios  string   `json:"Horarios"`
	Accesibilidad  string   `json:"Accesibilidad"`
	TipoRecinto  string   `json:"TipoRecinto"`
	Tips  string   `json:"Tips"`
}
type SearchPortal struct {
	Title  string
	Titles string
}
type Key struct {
	Amount    int    `json:"amount"`
	PortalKey string `json:"portalKey"`
	AgentKey  string `json:"agentKey"`
}

func SavePortalHttp(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	stringkey := vars["key"]
	defer r.Body.Close()
	body, _ := ioutil.ReadAll(r.Body)
	var portal Portal
	err := json.Unmarshal(body, &portal)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	c := appengine.NewContext(r)
	key, err := portal.save(c, stringkey)
	var p1 Portal
	if err := datastore.Get(c, key, &p1); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	q := datastore.NewQuery("Key").Filter("PortalKey=", stringkey)
	if _, err = q.GetAll(c, &p1.Keys); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	b, _ := json.Marshal(p1)
	w.Header().Set("content-type", "application/json")
	fmt.Fprintf(w, string(b))
}
func GetPortalsHttp(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	url_parsed := r.URL.Query()
	var labels string
	if len(url_parsed["labels"]) > 0 {
		labels = url_parsed["labels"][0]
	}
	var cursor string
	if len(url_parsed["cursor"]) > 0 {
		cursor = url_parsed["cursor"][0]
	}
	title := url_parsed["title"]
	if len(title) != 0 {
		portals2, err := SearchPortals(c, title[0])
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		b, _ := json.Marshal(&portals2)
		fmt.Fprintf(w, string(b))
	} else {
		portals, cursor, err := GetPortals(c, labels, cursor)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		w.Header().Set("content-type", "application/json")
		w.Header().Set("cursor", cursor)
		b, _ := json.Marshal(&portals)
		fmt.Fprintf(w, string(b))
	}
}

func GetPortal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	stringkey := vars["key"]
	c := appengine.NewContext(r)
	key := datastore.NewKey(c, "Portal", stringkey, 0, nil)
	var portal Portal
	if err := datastore.Get(c, key, &portal); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	b, _ := json.Marshal(&portal)
	w.Header().Set("content-type", "application/json")
	fmt.Fprintf(w, "[%s]", string(b))
}

func (portal Portal) save(c appengine.Context, portalId string) (*datastore.Key, error) {
	key := datastore.NewKey(c, "Portal", portalId, 0, nil)
	//save portal keys
	keys := portal.Keys
	for _, val := range keys {
		val.PortalKey = portalId
		kkey := datastore.NewKey(c, "Key", portalId+val.AgentKey, 0, nil)
		datastore.Put(c, kkey, &val)
	}
	for _, val := range portal.Labels {
		SaveLabel(c, val)
	}
	_, err := datastore.Put(c, key, &portal)

	index, err := search.Open("portals")
	c.Infof("II : %s", index)
	c.Infof("Error : %s", err)
	if err != nil {
		//http.Error(w, err.Error(), http.StatusInternalServerError)
		return nil, err
	}
	id, err := index.Put(c, "", &SearchPortal{Title: portal.Title, Titles: tokenize(portal.Title)})
	c.Infof("Index : %s", id)
	c.Infof("Error : %s", err)
	if err != nil {
		//http.Error(w, err.Error(), http.StatusInternalServerError)
		return key, err
	}
	return key, err
}

func SearchPortals(c appengine.Context, title string) ([]SearchPortal, error) {
	index, err := search.Open("portals")
	if err != nil {
		return nil, nil
	}
	var portals []SearchPortal
	for t := index.Search(c, "Titles: "+title, nil); ; {
		var sp SearchPortal
		id, err := t.Next(&sp)
		if err == search.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		portals = append(portals, sp)
		c.Infof("encontrado %s id --->%s", sp, id)
	}
	return portals, nil
}
func tokenize(line string) string {
	var tokens []string
	splits := strings.Split(line, " ")
	for _, word := range splits {
		ini := 0
		for i := 0; i < len(word); i = i + 1 {
			if utf8.Valid([]byte(word[ini : i+1])) {
				tokens = append(tokens, string(word[ini:i+1]))
			}
		}
	}
	return strings.Join(tokens, " ")
}
func GetPortals(c appengine.Context, labels string, cursor string) ([]Portal, string, error) {
	q := datastore.NewQuery("Portal")
	if cursor != "" {
		dCursor, err := datastore.DecodeCursor(string(cursor))
		if err == nil {
			q = q.Start(dCursor)
		}
	}
	if len(labels) == 0 {
		q = q.Limit(30)
	} else {
		splits := strings.Split(labels, " ")
		c.Infof("query....%s", splits)
		q = q.Filter("Labels=", splits[0]).Limit(10)
	}
	var portals []Portal
	if _, err := q.GetAll(c, &portals); err != nil {
		return portals, "", err
	}
	for i := range portals {
		q := datastore.NewQuery("Key").Filter("PortalKey=", portals[i].Title)
		if _, err := q.GetAll(c, &portals[i].Keys); err != nil {
			return portals, "", err
		}
	}
	return portals, "", nil
}
