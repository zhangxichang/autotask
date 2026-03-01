package main

import (
	"fmt"
	"net/http"
	"os"
)

func main() {
	address := "127.0.0.1:8080"
	fmt.Printf("WebUI地址: http://%v\n", address)
	if err := http.ListenAndServe(address, http.FileServer(http.Dir("dist"))); err != nil {
		fmt.Printf("%v", err)
		os.Exit(-1)
	}
}
