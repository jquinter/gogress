package portals

import (
	"appengine"
	"appengine/datastore"
)

type Label struct {
	Name string `json:"name"`
}

func GetLabel(c appengine.Context, name string) ([]Label, error) {
	q := datastore.NewQuery("Label").Filter("Name=", name).Limit(1)
	var labels []Label
	keys, err := q.GetAll(c, &labels)
	if err != nil {
		return labels, err
	}
	c.Infof("GetLabel keys %s", keys)
	return labels, nil
}
func SaveLabel(c appengine.Context, name string) (Label, error) {
	labels, err := GetLabel(c, name)
	if len(labels) != 0 {
		return labels[0], nil
	}
	key := datastore.NewIncompleteKey(c, "Label", nil)
	label := Label{Name: name}
	key, err = datastore.Put(c, key, &label)
	if err != nil {
		c.Errorf("error saving label (%v) - %v", name, err, key)
		return label, err
	}
	//c.Infof("key -> %d %s", key.IntID(), key.StringID())
	return label, nil
}
func GetLikeLabel(name string, c appengine.Context) []Label {
	q := datastore.NewQuery("Label").Limit(10)
	labels := make([]Label, 0, 10)
	if _, err := q.GetAll(c, &labels); err != nil {
		return labels
	}
	return labels
}
