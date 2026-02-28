package cmd

import (
	"autotask/cmd/at"
	"fmt"
	"os"

	"github.com/moby/moby/client"
	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
)

func AutoTaskCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "at",
		Short: "调用 Docker 执行自动化任务",
		Args:  cobra.MaximumNArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			if len(args) == 0 {
				return cmd.Help()
			}
			task_file_path := args[0]
			task_name := args[1]
			data, err := os.ReadFile(task_file_path)
			if err != nil {
				return err
			}
			tasks := at.Tasks{}
			if err := yaml.Unmarshal(data, &tasks); err != nil {
				return err
			}
			task := tasks.Tasks[task_name]
			fmt.Printf("运行任务：%s\n", task.Name)
			cli, err := client.New()
			if err != nil {
				return err
			}
			defer cli.Close()
			fmt.Printf("请求拉取镜像：%s\n", task.Image)
			pull, err := cli.ImagePull(cmd.Context(), task.Image, client.ImagePullOptions{})
			if err != nil {
				return err
			}
			defer pull.Close()
			fmt.Println("开始下载")
			for message, err := range pull.JSONMessages(cmd.Context()) {
				if err != nil {
					return err
				}
				if message.Error != nil {
					return fmt.Errorf("拉取镜像失败：%s", message.Error.Message)
				}
				fmt.Println(message.Status)
			}
			return nil
		},
	}
}
