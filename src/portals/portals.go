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
	"strings"
)

type Portal struct {
	Id                  string   `json:"id"`
	Title               string   `json:"title"`
	Lat                 float32  `json:"lat"`
	Lon                 float32  `json:"lon"`
	Image               string   `json:"image"`
	Keys                []Key    `json:"keys" datastore:"-"`
	Labels              []string `json:"labels"`
	TelefoniaDisponible string   `json:"telefoniaDisponible"`
	Horarios            string   `json:"horarios"`
	Accesibilidad       string   `json:"accesibilidad"`
	TipoRecinto         string   `json:"tipoRecinto"`
	Tips                string   `json:"tips"`
	Address             string   `json:"address"`
}

func SavePortalHttp(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	vars := mux.Vars(r)
	stringkey := vars["key"]
	defer r.Body.Close()
	body, _ := ioutil.ReadAll(r.Body)
	var portal Portal
	err := json.Unmarshal(body, &portal)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if !portalExists(c, portal.Id) {
		c.Infof("Saving new portal %s id %s", portal.Title, portal.Id)
		portal.Address = GetGeoCode(c, portal.Lat/1000000, portal.Lon/1000000)
	} else {
		c.Infof("Portal EXISTS!!!")
		var existingPortal Portal
		if err := datastore.Get(c, datastore.NewKey(c, "Portal", portal.Id, 0, nil), &existingPortal); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		portal.Address = existingPortal.Address
		if len(portal.Address) == 0 {
			portal.Address = GetGeoCode(c, portal.Lat/1000000, portal.Lon/1000000)
		} else {
			c.Infof("Dato geoCode ya existe, no lo consulto de nuevo")
		}
	}

	key, err := portal.save(c, stringkey)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var p1 Portal
	if err := datastore.Get(c, key, &p1); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	c.Infof("Success ! key = %s", key)
	b, _ := json.Marshal(portal)
	w.Header().Set("content-type", "application/json")
	fmt.Fprintf(w, string(b))

}
func GetPortalsHttp(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	url_parsed := r.URL.Query()

	var favorited []string
	checkfavorited := false
	if len(url_parsed["favorites"]) > 0 {
		if userId := GetUserId(r); userId != "" {
			var userData UserData
			datastore.Get(c, datastore.NewKey(c, "UserData", userId, 0, datastore.NewKey(c, "User", userId, 0, nil)), &userData)

			favorited = userData.Favourites
			checkfavorited = true
		}
	}
	var labels string
	if len(url_parsed["labels"]) > 0 {
		labels = url_parsed["labels"][0]
	}
	var cursor string
	if len(url_parsed["cursor"]) > 0 {
		cursor = url_parsed["cursor"][0]
	}
	title := url_parsed["query"]

	if len(title) != 0 {
		portals2, err := SearchPortals(c, title[0], checkfavorited, favorited)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		b, _ := json.Marshal(&portals2)
		w.Header().Set("content-type", "application/json")
		fmt.Fprintf(w, string(b))
	} else {
		portals, cursor, err := GetPortals(c, labels, checkfavorited, favorited, cursor)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		w.Header().Set("content-type", "application/json")
		w.Header().Set("cursor", cursor)
		b, _ := json.Marshal(&portals)
		fmt.Fprintf(w, string(b))
	}
}
func portalExists(c appengine.Context, id string) bool {
	var portal Portal
	if err := datastore.Get(c, datastore.NewKey(c, "Portal", id, 0, nil), &portal); err != nil {
		return false
	}
	return true
}
func MultiSave(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body, _ := ioutil.ReadAll(r.Body)
	var portals []Portal
	err := json.Unmarshal(body, &portals)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	c := appengine.NewContext(r)
	for _, portal := range portals {
		if !portalExists(c, portal.Id) {
			c.Infof("Saving new portal %s id %s", portal.Title, portal.Id)
			portal.Address = GetGeoCode(c, portal.Lat/1000000, portal.Lon/1000000)
			portal.save(c, portal.Id)
		}
	}
}
func (portal *Portal) Get(c appengine.Context, id string) error {
	if err := datastore.Get(c, datastore.NewKey(c, "Portal", id, 0, nil), portal); err != nil {
		return err
	}
	return nil
}

func GetPortal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	stringkey := vars["key"]
	c := appengine.NewContext(r)
	var portal Portal
	if err := portal.Get(c, stringkey); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if _, err := datastore.NewQuery("Key").Filter("PortalId=", portal.Id).GetAll(c, &portal.Keys); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	b, _ := json.Marshal(&portal)
	w.Header().Set("content-type", "application/json")
	fmt.Fprintf(w, "%s", string(b))
}

func (portal Portal) save(c appengine.Context, portalId string) (*datastore.Key, error) {
	key := datastore.NewKey(c, "Portal", portalId, 0, nil)
	//save portal keys
	keys := portal.Keys
	for i := range keys {
		keys[i].PortalId = portalId
		var agentId int64
		if keys[i].AgentId != 0 {
			agentId = keys[i].AgentId
		} else if keys[i].Agent.Id != 0 {
			agentId = keys[i].Agent.Id
		} else {
			return nil, fmt.Errorf("laca")
		}
		keys[i].AgentId = agentId
		kkey := datastore.NewKey(c, "Key", portalId+strconv.FormatInt(agentId, 10), 0, nil)
		datastore.Put(c, kkey, &keys[i])
	}
	for _, val := range portal.Labels {
		SaveLabel(c, val)
	}
	_, err := datastore.Put(c, key, &portal)

	err = IndexPortal(c, portal)
	return key, err
}

func GetPortals(c appengine.Context, labels string, checkfavorited bool, favorited []string, cursor string) ([]Portal, string, error) {
	q := datastore.NewQuery("Portal")
	if cursor != "" {
		dCursor, err := datastore.DecodeCursor(string(cursor))
		if err == nil {
			q = q.Start(dCursor)
		}
	}
	if len(labels) == 0 {
		q = q.Limit(30)
	} else {
		splits := strings.Split(labels, " ")
		c.Infof("query....%s", splits)
		q = q.Filter("Labels=", splits[0]).Limit(10)
	}
	var portals []Portal
	t := q.Run(c)
	for i := 0; i < 10; i++ {
		var portal Portal
		_, err := t.Next(&portal)
		if err == datastore.Done {
			break
		}
		if err != nil {
			return portals, "", err
		}
		if _, err := datastore.NewQuery("Key").Filter("PortalId=", portal.Id).GetAll(c, &portal.Keys); err != nil {
			return portals, "", err
		}
		if checkfavorited {
			for _, portalid := range favorited {
				if portalid == portal.Id {
					portals = append(portals, portal)
				}
			}
		} else {
			portals = append(portals, portal)
		}
	}
	cursor1, err := t.Cursor()
	if err != nil {
		return portals, "", err
	}
	return portals, cursor1.String(), nil
}

func GetFavorites() {

}
