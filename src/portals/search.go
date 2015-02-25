package portals

import (
	"appengine"
	"appengine/datastore"
	"appengine/search"
	"net/http"
	"strings"
	"unicode/utf8"
)

type SearchPortal struct {
	Title   string
	Label   string
	Address string
}

func SearchPortals(c appengine.Context, query string, checkfavorited bool, favorited []string) ([]Portal, error) {
	c.Infof("%s", query)
	index, err := search.Open("portals")
	if err != nil {
		return nil, nil
	}
	var portals []SearchPortal
	var keys []*datastore.Key
	for t := index.Search(c, query, nil); ; {
		var sp SearchPortal
		id, err := t.Next(&sp)
		if err == search.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		if checkfavorited {
			for _, portalid := range favorited {
				if portalid == id {
					portals = append(portals, sp)
					keys = append(keys, datastore.NewKey(c, "Portal", id, 0, nil))
				}
			}
		} else {
			portals = append(portals, sp)
			keys = append(keys, datastore.NewKey(c, "Portal", id, 0, nil))
		}
	}
	portals2 := make([]Portal, len(keys))
	datastore.GetMulti(c, keys, portals2)

	for portalindex, portal := range portals2 {
		if _, err := datastore.NewQuery("Key").Filter("PortalId=", portal.Id).GetAll(c, &portal.Keys); err != nil {
		}
		portals2[portalindex] = portal
	}

	c.Infof("portals: %s", portals2)
	return portals2, nil
}
func tokenize(line string) string {
	var tokens []string
	splits := strings.Split(line, " ")
	for _, word := range splits {
		ini := 0
		for i := 1; i < len(word); i = i + 1 {
			if utf8.Valid([]byte(word[ini : i+1])) {
				tokens = append(tokens, string(word[ini:i+1]))
			}
		}
	}
	return strings.Join(tokens, " ")
}

func (sp *SearchPortal) ToIndex(portal Portal) {
	sp.Title = tokenize(portal.Title)
	sp.Label = strings.Join(portal.Labels, " ")
	sp.Address = portal.Address
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
		var sp SearchPortal
		sp.ToIndex(portal)
		c.Infof("reindex - %s", portal)
		_, err = index.Put(c, portal.Id, &sp)
		if err != nil {
			c.Errorf("%s", err)
			return
		}
		c.Infof("indexint portal id: %s", portal.Id)
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
}

func IndexPortal(c appengine.Context, portal Portal) error {
	index, err := search.Open("portals")
	if err != nil {
		return err
	}
	var sp SearchPortal
	sp.ToIndex(portal)
	_, err = index.Put(c, portal.Id, &sp)
	if err != nil {
		c.Infof("Error al indexar portal %s, id: %s", portal.Title, portal.Id)
		//http.Error(w, err.Error(), http.StatusInternalServerError)
		return err
	}
	return nil
}
