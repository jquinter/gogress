package main

import (
	"github.com/gorilla/mux"
	"net/http"
	"portals"
)

func init() {
	r := mux.NewRouter()
	//r := s.HandleFunc("/*", portals.Test).Subrouter()
	//r.HandleFunc("/api/portal/", portals.GetPortalsHttp).Methods("GET")
	r.Handle("/api/portal/", portals.AuthHandler(portals.GetPortalsHttp)).Methods("GET")
	r.Handle("/api/portal/{key}", portals.AuthHandler(portals.SavePortalHttp)).Methods("POST")
	r.Handle("/api/portal/{key}", portals.AuthHandler(portals.GetPortal)).Methods("GET")

	r.Handle("/api/portals/", portals.AuthHandler(portals.MultiSave)).Methods("POST")

	r.Handle("/api/agent/", portals.AuthHandler(portals.GetAgents)).Methods("GET")
	r.Handle("/api/agent/{key}", portals.AuthHandler(portals.GetAgent)).Methods("GET")
	r.Handle("/api/agent/{key}", portals.AuthHandler(portals.UpdateAgent)).Methods("POST")
	r.Handle("/api/agent/", portals.AuthHandler(portals.SaveAgent)).Methods("POST")

	r.Handle("/api/op/{key}", portals.AuthHandler(portals.SaveOperation)).Methods("POST")
	r.Handle("/api/op/", portals.AuthHandler(portals.GetOperations)).Methods("GET")

	r.Handle("/api/userdata/", portals.AuthHandler(portals.GetUserData)).Methods("GET")
	r.Handle("/api/userdata/", portals.AuthHandler(portals.SaveUserData)).Methods("POST")

	r.Handle("/api/label/", portals.AuthHandler(portals.GetLabelsHttp)).Methods("GET")
	r.HandleFunc("/api/admin/index/delete", portals.DeleteHandler).Methods("GET")
	r.HandleFunc("/api/admin/index/reindex", portals.ReIndex).Methods("GET")
	r.HandleFunc("/auth/google", portals.Authenticate).Methods("POST")
	http.Handle("/", r)
}
