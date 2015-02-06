package main

import (
	"github.com/gorilla/mux"
	"net/http"
	"portals"
)

func init() {
	r := mux.NewRouter()
	r.HandleFunc("/api/portal/", portals.GetPortals).Methods("GET")
	r.HandleFunc("/api/portal/{key}", portals.GetPortal).Methods("GET")
	r.HandleFunc("/api/portal/{key}", portals.SavePortal).Methods("POST")
	r.HandleFunc("/api/agent/{key}", portals.SaveAgent).Methods("POST")
	r.HandleFunc("/api/agent/", portals.GetAgents).Methods("POST")
	r.HandleFunc("/api/op/{key}", portals.SaveOperation).Methods("POST")
	r.HandleFunc("/api/op/", portals.GetOperations).Methods("POST")
	r.HandleFunc("/auth/google", portals.Authenticate).Methods("POST")
	http.Handle("/", r)
}
