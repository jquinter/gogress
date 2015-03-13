package main

import (
	"github.com/gorilla/mux"
	"net/http"
	"portals"
)

func init() {
	r := mux.NewRouter()
	api := r.PathPrefix("/api").Subrouter()
	portalRoute := api.PathPrefix("/portal").Subrouter()
	portalRoute.Handle("/", portals.AuthHandler(portals.GetPortalsHttp)).Methods("GET")
	portalRoute.Handle("/{key}", portals.AuthHandler(portals.SavePortalHttp)).Methods("POST")
	portalRoute.Handle("/{key}", portals.AuthHandler(portals.GetPortal)).Methods("GET")
	api.Handle("/portals/", portals.AuthHandler(portals.MultiSave)).Methods("POST")

	api.Handle("/agent/", portals.AuthHandler(portals.GetAgents)).Methods("GET")
	api.Handle("/agent/{key}", portals.AuthHandler(portals.GetAgent)).Methods("GET")
	api.Handle("/agent/{key}", portals.AuthHandler(portals.UpdateAgent)).Methods("POST")
	api.Handle("/agent/", portals.AuthHandler(portals.SaveAgent)).Methods("POST")

	api.Handle("/op/{key}", portals.AuthHandler(portals.SaveOperation)).Methods("POST")
	api.Handle("/op/", portals.AuthHandler(portals.GetOperations)).Methods("GET")

	api.Handle("/userdata/", portals.AuthHandler(portals.GetUserData)).Methods("GET")
	api.Handle("/userdata/", portals.AuthHandler(portals.SaveUserData)).Methods("POST")

	api.HandleFunc("/user/setagent/", SetAgent).Methods("POST")

	api.Handle("/label/", portals.AuthHandler(portals.GetLabelsHttp)).Methods("GET")
	api.HandleFunc("/admin/index/delete", portals.DeleteHandler).Methods("GET")
	api.HandleFunc("/admin/index/reindex", portals.ReIndex).Methods("GET")

	api.HandleFunc("/test", portals.AppendAddressToPortals).Methods("GET")
	api.HandleFunc("/updatePortalModel", portals.UpdatePortalModels).Methods("GET")

	keyRoute := api.PathPrefix("/key").Subrouter()
	keyRoute.HandleFunc("/", QueryKeys).Methods("GET")

	r.HandleFunc("/auth/google", portals.Authenticate).Methods("POST")
	//r.HandleFunc("/", GetTempalte).Methods("GET")
	http.Handle("/", r)
}
