package main

import (
	"appengine"
	"encoding/json"
	"fmt"
	"io/ioutil"
	//"github.com/gorilla/mux"
	"net/http"
	"portals"
)

func QueryKeys(w http.ResponseWriter, r *http.Request) {
	url_parsed := r.URL.Query()
	var cursor string
	if len(url_parsed["cursor"]) > 0 {
		cursor = url_parsed["cursor"][0]
	}
	c := appengine.NewContext(r)
	portalList, cursor, err := portals.QueryKeys(c, cursor)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("content-type", "application/json")
	b, _ := json.Marshal(&portalList)
	fmt.Fprintf(w, "%s", string(b))
}
func SaveKey(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body, _ := ioutil.ReadAll(r.Body)
	var key portals.Key
	if err := json.Unmarshal(body, &key); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if key.AgentId != portals.GetUserAgentId(r){
		http.Error(w, "Not authorized", http.StatusInternalServerError)
		return
	}
	if err := key.Save(appengine.NewContext(r)); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("content-type", "application/json")
	b, _ := json.Marshal(&key)
	fmt.Fprintf(w, "%s", string(b))
}

func SetAgent(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body, _ := ioutil.ReadAll(r.Body)
	var agent portals.Agent
	err := json.Unmarshal(body, &agent)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if agent.CodeName == "" {
		http.Error(w, "No Codename", http.StatusInternalServerError)
		return
	}
	c := appengine.NewContext(r)
	userId := portals.GetUserId(r)
	if err := portals.AssociateAgentToUser(c, agent, userId); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	return
}
