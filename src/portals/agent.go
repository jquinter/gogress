package portals

import (
	"appengine"
	"appengine/datastore"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"io/ioutil"
	"net/http"
	"strconv"
)

type Agent struct {
	Id       int64  `json:"id" datastore:"-"`
	CodeName string `json:"codeName"`
	RealName string `json:"realName"`
	Email    string `json:"email"`
}

func GetByCodeName(c appengine.Context, name string) (*Agent, error) {
	var agents []Agent
	keys, err := datastore.NewQuery("Agent").Filter("CodeName=", name).GetAll(c, &agents)
	if err != nil {
		return nil, err
	}
	if len(agents) == 0 {
		return nil, nil
	}
	c.Infof("err..%s", agents)
	agents[0].Id = keys[0].IntID()
	return &agents[0], nil
}
func (agent *Agent) Save(c appengine.Context) error {
	c.Infof("Saving agent %s", agent)
	count, err := datastore.NewQuery("Agent").Filter("CodeName =", agent.CodeName).Count(c)
	c.Infof("count, err", count, err)
	if count > 0 || err != nil {
		if count > 0 {
			return fmt.Errorf("CodeName allready exists")
		} else {
			return err
		}
	}
	key := datastore.NewIncompleteKey(c, "Agent", nil)
	key2, err := datastore.Put(c, key, agent)
	if err != nil {
		return err
	}
	c.Infof("key1 %s, key2 %s", key, key2)
	agent.Id = key2.IntID()
	return nil
}
func (agent Agent) Update(c appengine.Context) error {
	key := datastore.NewKey(c, "Agent", "", agent.Id, nil)
	_, err := datastore.Put(c, key, &agent)
	return err
}
func UpdateAgent(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["key"], 10, 64)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer r.Body.Close()
	body, _ := ioutil.ReadAll(r.Body)
	var agent Agent
	err = json.Unmarshal(body, &agent)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	agent.Id = id
	c := appengine.NewContext(r)
	if err = agent.Update(c); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	b, _ := json.Marshal(&agent)
	w.Header().Set("content-type", "application/json")
	fmt.Fprintf(w, "%s", string(b))
}
func SaveAgent(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body, _ := ioutil.ReadAll(r.Body)
	var agent Agent
	err := json.Unmarshal(body, &agent)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	c := appengine.NewContext(r)
	err = agent.Save(c)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	b, _ := json.Marshal(&agent)
	w.Header().Set("content-type", "application/json")
	fmt.Fprintf(w, "%s", string(b))
}
func GetAgents(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	q := datastore.NewQuery("Agent").Limit(10)
	agents := make([]Agent, 0, 10)
	keys, err := q.GetAll(c, &agents)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	for id, key := range keys {
		agents[id].Id = key.IntID()
	}
	b, _ := json.Marshal(&agents)
	w.Header().Set("content-type", "application/json")
	fmt.Fprintf(w, string(b))
}

func GetAgent(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["key"], 10, 64)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	c := appengine.NewContext(r)
	key := datastore.NewKey(c, "Agent", "", id, nil)
	var agent Agent
	if err := datastore.Get(c, key, &agent); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	agent.Id = id
	b, _ := json.Marshal(&agent)
	w.Header().Set("content-type", "application/json")
	fmt.Fprintf(w, "%s", string(b))
}
