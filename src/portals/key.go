package portals

import (
	"appengine"
	"appengine/datastore"
)

type Key struct {
	Amount   int    `json:"amount"`
	PortalId string `json:"portalId"`
	AgentId  int64  `json:"agentId"`
	Agent    Agent  `json:"agent,omitempty" datastore:"-"`
	Portal   Portal `json:"portal,omitempty" datastore:"-"`
}

func QueryKeys(c appengine.Context, cursor string) ([]Key, string, error) {
	var items []Key
	q := datastore.NewQuery("Key")
	if cursor != "" {
		dCursor, err := datastore.DecodeCursor(string(cursor))
		if err == nil {
			q = q.Start(dCursor)
		}
	}
	t := q.Run(c)
	for i := 0; i < 10; i++ {
		var item Key
		_, err := t.Next(&item)
		if err == datastore.Done {
			break
		}
		if err != nil {
			return items, "", nil
		}
		item.Agent.Get(c, item.AgentId)
		item.Portal.Get(c, item.PortalId)
		items = append(items, item)
	}
	returnedCursor, err := t.Cursor()
	if err != nil {
		return items, "", err
	}
	return items, returnedCursor.String(), nil
}

func (key *Key) Get(c appengine.Context, id string) error {
	if err := datastore.Get(c, datastore.NewKey(c, "Key", id, 0, nil), key); err != nil {
		return err
	}
	return nil
}
