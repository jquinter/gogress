package portals

import (
	"appengine/aetest"
	"testing"
)

func TestComposeNewsletter(t *testing.T) {
	c, err := aetest.NewContext(nil)
	if err != nil {
		t.Fatal(err)
	}
	defer c.Close()
	label, err := SaveLabel("casa", c)
	labels, err := GetPortals(c, "")
	t.Errorf("composeMessage(), %s, %s. %s", label, labels, err)
}
