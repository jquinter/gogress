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
