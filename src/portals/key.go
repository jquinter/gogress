package portals

import (
	"appengine"
	"appengine/datastore"
	"fmt"
	"strconv"
)

type Key struct {
	Id       string `json:"ìd" datastore:"-"`
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
		k, err := t.Next(&item)
		if err == datastore.Done {
			break
		}
		if err != nil {
			return items, "", nil
		}
		item.Id = k.StringID()
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

func (key *Key) Get(c appengine.Context) error {
	if err := datastore.Get(c, datastore.NewKey(c, "Key", key.Id, 0, nil), key); err != nil {
		return err
	}
	key.Id = key.PortalId + strconv.FormatInt(key.AgentId, 10)
	return nil
}

func (key *Key) Save(c appengine.Context) error {
	var kk *datastore.Key
	if key.Id == "" {
		if key.AgentId == 0 || key.PortalId == "" {
			return fmt.Errorf("No key id, portal id or agent id")
		}
		kk = datastore.NewKey(c, "Key", key.PortalId+strconv.FormatInt(key.AgentId, 10), 0, nil)
	} else {
		kk = datastore.NewKey(c, "Key", key.Id, 0, nil)
	}
	_, err := datastore.Put(c, kk, key)
	if err != nil {
		return err
	}
	key.Id = kk.StringID()
	return nil
}
