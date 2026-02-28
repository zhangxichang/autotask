package main

import (
	"fmt"
	"os"

	"autotask/cmd"
)

func main() {
	at_cmd := cmd.AutoTaskCommand()
	at_cmd.AddCommand(cmd.VersionCommand())
	if err := at_cmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "错误：%v\n", err)
		os.Exit(-1)
	}
}
