package guestbook
import (
        "html/template"
        "net/http"
        "time"
        "appengine"
        "appengine/datastore"
        "appengine/user"
        "fmt"
        "io/ioutil"
        "encoding/json"
        "github.com/gorilla/mux"
)

type Greeting struct {
        Author  string
        Content string
        Date    time.Time
}

type Portal struct {
    Title string `json:"title"`
    Lat float32 `json:"lat"`
    Lon float32 `json:"lon"`
    Image string `json:"image"`
}
func init() {
    r := mux.NewRouter()
    r.HandleFunc("/api/portal/", getPortals).Methods("GET")
    r.HandleFunc("/api/portal/{key}", getPortal).Methods("GET")
    r.HandleFunc("/api/portal/{key}", savePortal).Methods("PUT")
    r.HandleFunc("/api/portal/{key}", savePortal).Methods("POST")
    //r.HandleFunc("/products", ProductsHandler)
    //r.HandleFunc("/articles", ArticlesHandler)
    http.Handle("/", r)
    //http.HandleFunc("/", root)
    //http.HandleFunc("/sign", sign)
    //http.HandleFunc("/api/portal", getPortal)
}

// guestbookKey returns the key used for all guestbook entries.
func guestbookKey(c appengine.Context) *datastore.Key {
        // The string "default_guestbook" here could be varied to have multiple guestbooks.
        return datastore.NewKey(c, "Guestbook", "default_guestbook", 0, nil)
}

// [START func_root]
func root(w http.ResponseWriter, r *http.Request) {
        c := appengine.NewContext(r)
        // Ancestor queries, as shown here, are strongly consistent with the High
        // Replication Datastore. Queries that span entity groups are eventually
        // consistent. If we omitted the .Ancestor from this query there would be
        // a slight chance that Greeting that had just been written would not
        // show up in a query.
        // [START query]
        q := datastore.NewQuery("Greeting").Ancestor(guestbookKey(c)).Order("-Date").Limit(10)
        // [END query]
        // [START getall]
        greetings := make([]Greeting, 0, 10)
        if _, err := q.GetAll(c, &greetings); err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
        }
        // [END getall]
        if err := guestbookTemplate.Execute(w, greetings); err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
        }
}
// [END func_root]

var guestbookTemplate = template.Must(template.New("book").Parse(`
<html>
  <head>
    <title>Go Guestbook</title>
  </head>
  <body>
    {{range .}}
      {{with .Author}}
        <p><b>{{.}}</b> wrote:</p>
      {{else}}
        <p>An anonymous person wrote:</p>
      {{end}}
      <pre>{{.Content}}</pre>
    {{end}}
    <form action="/sign" method="post">
      <div><textarea name="content" rows="3" cols="60"></textarea></div>
      <div><input type="submit" value="Sign Guestbook"></div>
    </form>
  </body>
</html>
`))
func getPortals(w http.ResponseWriter, r *http.Request) {
    c := appengine.NewContext(r)
    q := datastore.NewQuery("Portal").Limit(10)
    portals := make([]Portal, 0, 10)
    if _, err := q.GetAll(c, &portals); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    b,_ := json.Marshal(&portals)
    w.Header().Set("content-type","application/json")
    fmt.Fprintf(w, string(b))
}
func getPortal(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    stringkey := vars["key"]
    c := appengine.NewContext(r)
    key := datastore.NewKey(c, "Portal", stringkey, 0, nil)
    var portal Portal
    if err := datastore.Get(c, key, &portal); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    b,_ := json.Marshal(&portal)
    w.Header().Set("content-type","application/json")
    fmt.Fprintf(w, string(b))
}
func savePortal(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    stringkey := vars["key"]
    defer r.Body.Close()
    body, _ := ioutil.ReadAll(r.Body)
    //portal := Portal{Title:"El portal"}
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
        fmt.Fprintf(w, "[")
        fmt.Fprintf(w, key.StringID())
        b, _ := json.Marshal(p1)
        fmt.Fprintf(w, string(b))
        fmt.Fprintf(w, "]")
    }
}
// [START func_sign]
func sign(w http.ResponseWriter, r *http.Request) {
        c := appengine.NewContext(r)
        g := Greeting{
                Content: r.FormValue("content"),
                Date:    time.Now(),
        }
        if u := user.Current(c); u != nil {
                g.Author = u.String()
        }
        // We set the same parent key on every Greeting entity to ensure each Greeting
        // is in the same entity group. Queries across the single entity group
        // will be consistent. However, the write rate to a single entity group
        // should be limited to ~1/second.
        key := datastore.NewIncompleteKey(c, "Greeting", guestbookKey(c))
        _, err := datastore.Put(c, key, &g)
        if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
        }
        //http.Redirect(w, r, "/", http.StatusFound)
}
// [END func_sign] 