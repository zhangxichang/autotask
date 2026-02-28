package main

type Task struct {
	Name  string `yaml:"name"`
	Image string `yaml:"image"`
	Run   string `yaml:"run"`
}

type Tasks struct {
	Tasks map[string]Task `yaml:"tasks"`
}
