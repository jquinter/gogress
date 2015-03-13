package portals

import (
	"appengine"
	"appengine/datastore"
	"fmt"
)

type User struct {
	Id        string
	Email     string
	Name      string `json:"name"`
	Allowed   bool
	AgentName string
	AgentId   int64
}

func (user *User) Get(c appengine.Context, id string) error {
	if err := datastore.Get(c, datastore.NewKey(c, "User", id, 0, nil), user); err != nil {
		return err
	}
	return nil
}

func AssociateAgentToUser(c appengine.Context, agent Agent, userId string) error {
	var user User
	if err := user.Get(c, userId); err != nil {
		return err
	}
	if user.AgentId != 0 {
		return fmt.Errorf("User allready associated to agent, contact admin")
	}
	if err := agent.GetByCodeName(c); err != nil {
		return fmt.Errorf("Agent doesent exists")
	}
	if ExistsUserAssociatedToAgent(c, agent) {
		return fmt.Errorf("Agent allready associated to other user")
	}
	user.AgentId = agent.Id
	user.Save(c)
	return nil
}

func (user *User) Save(c appengine.Context) error {
	if _, err := datastore.Put(c, datastore.NewKey(c, "User", user.Id, 0, nil), user); err != nil {
		return err
	}
	return nil
}
func ExistsUserAssociatedToAgent(c appengine.Context, agent Agent) bool {
	c.Infof("---", agent)
	if total, err := datastore.NewQuery("User").Filter("AgentId=", agent.Id).Count(c); err != nil || total > 0 {
		return true
	}
	return false
}
