package portals

import (
	"appengine"
	"appengine/datastore"
)

type Label struct {
	Id       int64    `json:"Id" datastore:"-"`
	Name     string `json:"name"`
}

func SaveLabel(name string, c appengine.Context) (Label, error) {
	key := datastore.NewKey(c, "Label", "", 0, nil)
	label := Label{ Name: name }
	key, err := datastore.Put(c, key, &label)

    if err != nil {
		c.Errorf("error saving label (%v) - %v", name, err)
    }

	label.Id = key.IntID()
	return label, err
}
func GetLabelName(name string, c appengine.Context) []Label {
	q := datastore.NewQuery("Label").Limit(10)
	labels := make([]Label, 0, 10)
	if _, err := q.GetAll(c, &labels); err != nil {
		return labels
	}
	return labels
}
func GetLabel(id string, c appengine.Context) Label{
	key := datastore.NewKey(c, "Label", id, 0, nil)
	var label Label
	if err := datastore.Get(c, key, &label); err != nil && err != datastore.ErrNoSuchEntity{
		c.Errorf("error retrieving label (id = %v) - %v", id, err)
	}
	return label
}
