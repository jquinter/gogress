package portals
import (
	"appengine"
	"appengine/datastore"
	"appengine/search"
	"strings"
	"net/http"
	"unicode/utf8"
)
type SearchPortal struct {
	Titles string
	Tags []string 
}

func SearchPortals(c appengine.Context, title string) ([]Portal, error) {
	index, err := search.Open("portals")
	if err != nil {
		return nil, nil
	}
	var portals []SearchPortal
	var keys []*datastore.Key
	for t := index.Search(c, "Titles: "+title, nil); ; {
		var sp SearchPortal
		id, err := t.Next(&sp)
		if err == search.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		portals = append(portals, sp)
		keys = append(keys, datastore.NewKey(c, "Portal", id, 0, nil))
	}
	portals2 := make([]Portal, len(keys))
	datastore.GetMulti(c, keys, portals2)
	c.Infof("portals: %s", portals2)
	return portals2, nil
}
func tokenize(line string) string {
	var tokens []string
	splits := strings.Split(line, " ")
	for _, word := range splits {
		ini := 0
		for i := 0; i < len(word); i = i + 1 {
			if utf8.Valid([]byte(word[ini : i+1])) {
				tokens = append(tokens, string(word[ini:i+1]))
			}
		}
	}
	return strings.Join(tokens, " ")
}

func ReIndex(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	t := datastore.NewQuery("Portal").Run(c)
	index, _ := search.Open("portals")
	for {
		var portal Portal
		_, err := t.Next(&portal)
		if err == datastore.Done {
			break
		}
		if err != nil {
			return
		}
		c.Infof("indexint portal id: %s title: %s", portal.Id, portal.Title)
		index.Put(c, portal.Id, &SearchPortal{Titles: tokenize(portal.Title)})
	}
}
func DeleteHandler(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	index, _ := search.Open("portals")

	for t := index.List(c, nil); ; {
		var portal Portal
		id, err := t.Next(&portal)
		if err == search.Done {
			break
		}
		if err != nil {
			return
		}
		index.Delete(c, id)
		c.Infof("deleting index %s", id)
	}

	/*if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	id := "PA6-5000"
	err = index.Delete(c, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Fprint(w, "Deleted document: ", id)*/
}

func (sportal SearchPortal) Convert(portal Portal) {
   sportal = SearchPortal{Titles: tokenize(portal.Title)}
}
func IndexPortal(c appengine.Context, portal Portal) (error) {
	index, err := search.Open("portals")
	if err != nil {
		return err
	}
	_, err = index.Put(c, portal.Id, &SearchPortal{Titles: tokenize(portal.Title)})
	if err != nil {
		c.Infof("Error al indexar portal %s, id: %s", portal.Title, portal.Id)
		//http.Error(w, err.Error(), http.StatusInternalServerError)
		return err
	}
	return nil
}