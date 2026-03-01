package app

import (
	tea "charm.land/bubbletea/v2"
)

type App struct {
}

func New() App {
	return App{}
}
func (app App) Init() tea.Cmd {
	return nil
}
func (app App) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyPressMsg:
		switch msg.String() {
		case "ctrl+c":
			return app, tea.Quit
		}
	}
	return app, nil
}
func (app App) View() tea.View {
	return tea.NewView("")
}
