package config

import "testing"

func TestLoad(t *testing.T) {
	for _, tt := range []struct {
		name, input, want string
		invalid           bool
	}{
		{"default loopback", "", "127.0.0.1:8080", false},
		{"container", "0.0.0.0:8080", "0.0.0.0:8080", false},
		{"IPv6", "[::1]:8080", "[::1]:8080", false},
		{"no port", "localhost", "", true},
		{"implicit wildcard", ":8080", "", true},
		{"zero", "localhost:0", "", true},
		{"large port", "localhost:65536", "", true},
		{"named port", "localhost:http", "", true},
	} {
		t.Run(tt.name, func(t *testing.T) {
			cfg, err := Load(func(string) string { return tt.input })
			if (err != nil) != tt.invalid || cfg.HTTPAddress != tt.want {
				t.Fatalf("Load = %#v, %v; want address %q, invalid %v", cfg, err, tt.want, tt.invalid)
			}
		})
	}
}
