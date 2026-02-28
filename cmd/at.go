package cmd

import (
	"github.com/spf13/cobra"
)

func AutoTaskCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "at",
		Short: "调用 Docker 执行自动化任务",
		Args:  cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if len(args) == 0 {
				return cmd.Help()
			}
			return nil
		},
	}
}
