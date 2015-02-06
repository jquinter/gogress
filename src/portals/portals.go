package portals

import (
	"appengine"
	"appengine/datastore"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	//"google.golang.org/api/plus/v1"
	"io/ioutil"
	"net/http"
)

type Operation struct {
	Title   string   `json:"title"`
	Portals []Portal `json:"portals"`
}
type Portal struct {
	Title string  `json:"title"`
	Lat   float32 `json:"lat"`
	Lon   float32 `json:"lon"`
	Image string  `json:"image"`
	Keys  []Key   `json:"keys" datastore:"-"`
}
type Key struct {
	Amount    int    `json:"amount"`
	PortalKey string `json:"portalKey"`
	AgentKey  string `json:"agentKey"`
}
type Agent struct {
	name     string `json:"name"`
	realName string `json:"realName"`
}

func SaveAgent(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	stringkey := vars["key"]
	defer r.Body.Close()
	body, _ := ioutil.ReadAll(r.Body)
	var agent Agent
	err := json.Unmarshal(body, &agent)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	c := appengine.NewContext(r)
	key := datastore.NewKey(c, "Agent", stringkey, 0, nil)
	key, err = datastore.Put(c, key, &agent)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
func GetAgents(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	q := datastore.NewQuery("Agent").Limit(10)
	agents := make([]Agent, 0, 10)
	if _, err := q.GetAll(c, &agents); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	b, _ := json.Marshal(&agents)
	w.Header().Set("content-type", "application/json")
	fmt.Fprintf(w, string(b))
}
func SaveOperation(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	stringkey := vars["key"]
	defer r.Body.Close()
	body, _ := ioutil.ReadAll(r.Body)
	var op Operation
	err := json.Unmarshal(body, &op)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	c := appengine.NewContext(r)
	key := datastore.NewKey(c, "Operation", stringkey, 0, nil)
	key, err = datastore.Put(c, key, &op)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
func GetOperations(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	q := datastore.NewQuery("Operation").Limit(10)
	operations := make([]Operation, 0, 10)
	if _, err := q.GetAll(c, &operations); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	b, _ := json.Marshal(&operations)
	w.Header().Set("content-type", "application/json")
	fmt.Fprintf(w, string(b))
}
func SavePortal(w http.ResponseWriter, r *http.Request) {
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
	keys := portal.Keys
	/*keys := make([]Key, 0, 2)
	if err = json.Unmarshal([]byte(portal.Keys), &keys); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}*/
	c := appengine.NewContext(r)
	var key *datastore.Key
	//err = datastore.RunInTransaction(c, func(c appengine.Context) error {
	key = datastore.NewKey(c, "Portal", stringkey, 0, nil)
	for _, val := range keys {
		val.PortalKey = stringkey
		kkey := datastore.NewKey(c, "Key", val.PortalKey+val.AgentKey, 0, nil)
		datastore.Put(c, kkey, &val)
	}
	key, err = datastore.Put(c, key, &portal)
	//return err
	//}, nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
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

func GetPortals(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	q := datastore.NewQuery("Portal").Limit(10)
	var portals []Portal
	if _, err := q.GetAll(c, &portals); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	for i := range portals {
		q := datastore.NewQuery("Key").Filter("PortalKey=", portals[i].Title)
		if _, err := q.GetAll(c, &portals[i].Keys); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		c.Infof(">>%s", portals[i].Keys)
	}
	b, _ := json.Marshal(&portals)
	w.Header().Set("content-type", "application/json")
	fmt.Fprintf(w, string(b))
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
	fmt.Fprintf(w, string(b))
}

type SattelizerData struct {
	ClientId    string `json:"clientId"`
	Code        string `json:"code"`
	RedirectUri string `json:"redirectUri"`
}

func Authenticate(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body, _ := ioutil.ReadAll(r.Body)
	var sattData SattelizerData
	err := json.Unmarshal(body, &sattData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
