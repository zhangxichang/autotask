package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

func VersionCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "version",
		Short: "显示版本信息",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Print("0.1.0")
		},
	}
}
