package portals

import (
	"appengine"
	"appengine/datastore"
	"appengine/urlfetch"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strconv"
)

type GeoCodeResponse struct {
	Results []GeoCode `json:"results"`
	Status  string    `json:"status"`
}
type GeoCode struct {
	//AddressComponents string `json:"address_components"`
	FormattedAddress string `json:"formatted_address"`
	//Geometry         string `json:"geometry"`
	//PlaceId string   `json:"place_id"`
	Types []string `json:"types"`
}

func GetGeoCode(c appengine.Context, lat float32, lon float32) string {
	client := urlfetch.Client(c)
	resp, err := client.Get("http://maps.googleapis.com/maps/api/geocode/json?latlng=" + strconv.FormatFloat(float64(lat), 'f', 6, 64) + "," + strconv.FormatFloat(float64(lon), 'f', 6, 64) + "&sensor=false")
	if err != nil {
		c.Errorf("%s", err.Error())
		return ""
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		c.Errorf("%s", err)
		return ""
	}
	var gc GeoCodeResponse
	err = json.Unmarshal(body, &gc)
	if err != nil {
		c.Errorf("%s", err)
		return ""
	}
	if len(gc.Results) > 0 && gc.Status == "OK" {
		return gc.Results[0].FormattedAddress
	}
	return ""
}
func UpdatePortalModels(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	var portals []Portal
	if keys, err := datastore.NewQuery("Portal").GetAll(c, &portals); err == nil {
		for i, portal := range portals {
			datastore.Put(c, keys[i], &portal)
		}
	} else {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
func AppendAddressToPortals(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	var portals []Portal

	if k, err := datastore.NewQuery("Portal").Filter("Address >=", "").Filter("Address <=", "").GetAll(c, &portals); err == nil {
		for i, portal := range portals {
			portal.Address = GetGeoCode(c, portal.Lat/1000000, portal.Lon/1000000)
			c.Infof("portal %s address %s", portal.Title, portal.Address)
			datastore.Put(c, k[i], &portal)
		}
	}
}
