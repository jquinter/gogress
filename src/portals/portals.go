package portals

import (
	"appengine"
	"appengine/datastore"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"io/ioutil"
	"net/http"
	"strings"
)

type Operation struct {
	Title   string   `json:"title"`
	Portals []Portal `json:"portals"`
}
type Portal struct {
	Title  string   `json:"title"`
	Lat    float32  `json:"lat"`
	Lon    float32  `json:"lon"`
	Image  string   `json:"image"`
	Keys   []Key    `json:"keys" datastore:"-"`
	Labels []string `json:"labels"`
}
type Key struct {
	Amount    int    `json:"amount"`
	PortalKey string `json:"portalKey"`
	AgentKey  string `json:"agentKey"`
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
func SavePortal(c appengine.Context, portalId string, portal Portal) (*datastore.Key, error) {
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
	return key, err
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
	key, err := SavePortal(c, stringkey, portal)
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

func GetPortals(c appengine.Context, labels string) ([]Portal, error) {
	var q *datastore.Query
	if len(labels) == 0 {
		q = datastore.NewQuery("Portal").Limit(10)
	} else {
		splits := strings.Split(labels, " ")
		c.Infof("query....%s", splits)
		q = datastore.NewQuery("Portal").Filter("Labels=", splits[0]).Limit(10)
	}
	var portals []Portal
	if _, err := q.GetAll(c, &portals); err != nil {
		return portals, err
	}
	for i := range portals {
		q := datastore.NewQuery("Key").Filter("PortalKey=", portals[i].Title)
		if _, err := q.GetAll(c, &portals[i].Keys); err != nil {
			return portals, err
		}
	}
	return portals, nil
}
func GetPortalsHttp(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	url_parsed := r.URL.Query()
	labels := url_parsed["labels"]
	if len(labels) == 0 {
		labels = []string{""}
	}
	portals, err := GetPortals(c, labels[0])
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
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

func Test(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	c.Infof("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
}
