package main

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	listener, err := net.Listen("tcp", "127.0.0.1:8080")
	if err != nil {
		fmt.Printf("❌ 端口绑定失败：%v\n", err)
		os.Exit(-1)
	}
	server := &http.Server{
		Handler: http.FileServer(http.Dir("dist")),
	}
	fmt.Printf("WebUI: http://%v\n", listener.Addr().String())
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-sigChan
		server.Shutdown(context.Background())
	}()
	if err := server.Serve(listener); err != nil && err != http.ErrServerClosed {
		fmt.Printf("❌ 服务运行出错: %v\n", err)
		os.Exit(-1)
	}
}
