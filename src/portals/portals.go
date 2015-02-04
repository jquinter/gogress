package portals

import (
	"appengine"
	"appengine/datastore"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
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
		fmt.Fprintf(w, "Error", err)
	} else {
		c := appengine.NewContext(r)
		key := datastore.NewKey(c, "Portal", stringkey, 0, nil)
		key, err := datastore.Put(c, key, &portal)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		var p1 Portal
		if err := datastore.Get(c, key, &p1); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		b, _ := json.Marshal(p1)
		fmt.Fprintf(w, string(b))
	}
}

func GetPortals(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	q := datastore.NewQuery("Portal").Limit(10)
	portals := make([]Portal, 0, 10)
	if _, err := q.GetAll(c, &portals); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
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
