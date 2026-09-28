package httpapi

import (
	"encoding/json"
	"net/http"
)

// NewHandler exposes process liveness only. Database readiness is added in Phase 1.
func NewHandler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-store")
		_ = json.NewEncoder(w).Encode(struct {
			Status     string `json:"status"`
			Service    string `json:"service"`
			APIVersion string `json:"api_version"`
		}{"ok", "controller", "v1"})
	})
	return mux
}
