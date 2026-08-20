const { 
    ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
    EmbedBuilder 
} = require('discord.js');

class HelpView {
    render(command, commandIndex, totalCommands) {
        const embed = new EmbedBuilder()
            .setColor(0x4F46E5)
            .setTitle('Command Help');

        const parameters = this.buildCommandOptionsString(command.options);

        embed.setDescription(
            [
                `Command Name: **/${command.name}**`,
                `Command Description: ${command.description}`,
                parameters ? `\nParameters:\n${parameters}` : null,
            ].filter(Boolean).join('\n')
        );

        const components = [];

        if (totalCommands > 1) {
            components.push(
                this.buildPaginationButtons(
                    commandIndex,
                    totalCommands,
                ),
            );
        }

        components.push(this.buildCloseButton())

        return {
            embeds: [embed],
            components,
        };
    }

    buildPaginationButtons(commandIndex, totalCommands) {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`help_prev:${commandIndex}`)
                    .setEmoji('⬅️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(commandIndex === 0),

                new ButtonBuilder()
                    .setCustomId(`help_next:${commandIndex}`)
                    .setEmoji('➡️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(commandIndex >= totalCommands - 1),
            );
    }

    buildCloseButton() {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_close')
                    .setLabel('Close')
                    .setStyle(ButtonStyle.Danger),
            );
    }

    buildCommandOptionsString(options) {
        if (!options?.length) {
            return null;
        }

        return options.map((option) => {
            const allowedValues = this.buildOptionChoicesString(option.choices);

            return [
                `Parameter Name: ${option.name}`,
                `Parameter Description: ${option.description}`,
                `Required: ${option.required ? 'Yes' : 'No'}`,
                allowedValues ? `Allowed values: ${allowedValues}` : null,
            ].filter(Boolean).join('\n')
        }).join('\n\n');
    }

    buildOptionChoicesString(choices) {
        if (!choices?.length) {
            return null;
        }

        return choices.map((choice) => {
            return `${choice.name}`;
        }).join(', ');
    }
}

module.exports = new HelpView();