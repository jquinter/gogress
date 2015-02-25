package main

import (
	"html/template"
	"net/http"
)

func GetTempalte(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.New("name").Parse(`{{define "T"}}Hello, {{.}}!{{end}}`)
	err = tmpl.ExecuteTemplate(w, "T", "<script>alert('you have been pwned')</script>")
	if err != nil {
		return
	}
}
