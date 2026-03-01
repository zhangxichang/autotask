package main

import (
	app "autotask/modules"
	"fmt"
	"os"

	tea "charm.land/bubbletea/v2"
)

func main() {
	app := tea.NewProgram(app.New())
	if _, err := app.Run(); err != nil {
		fmt.Printf("应用程序错误：%v", err)
		os.Exit(-1)
	}
}
