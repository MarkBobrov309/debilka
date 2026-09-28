FROM golang:1.25-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY cmd ./cmd
COPY internal ./internal
RUN CGO_ENABLED=0 go build -trimpath -o /controller ./cmd/controller

FROM alpine:3.23
RUN addgroup -S app && adduser -S -G app app
COPY --from=build /controller /usr/local/bin/controller
USER app
EXPOSE 8080
ENTRYPOINT ["controller"]
