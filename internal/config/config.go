// Package config loads the controller's process configuration, not node configs.
package config

import (
	"fmt"
	"net"
	"strconv"
)

type Config struct {
	HTTPAddress string
}

func Load(getenv func(string) string) (Config, error) {
	address := getenv("CONTROLLER_HTTP_ADDR")
	if address == "" {
		address = "127.0.0.1:8080"
	}
	host, port, err := net.SplitHostPort(address)
	if err != nil {
		return Config{}, fmt.Errorf("CONTROLLER_HTTP_ADDR must be host:port: %w", err)
	}
	number, err := strconv.Atoi(port)
	if host == "" || err != nil || number < 1 || number > 65535 {
		return Config{}, fmt.Errorf("CONTROLLER_HTTP_ADDR requires an explicit host and port 1..65535")
	}
	return Config{HTTPAddress: address}, nil
}
