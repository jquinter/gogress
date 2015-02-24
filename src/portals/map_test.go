package portals

import (
	"testing"
)

func TestGeoCode(t *testing.T) {
	err := geoCode(-33269979, -70286737)
	t.Errorf("TestGeoCode(), %s", err)
}
