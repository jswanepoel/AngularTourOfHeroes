import { Command, Option } from '../models/command';
export default class HelpCommand extends Command {
    readonly name: string;
    readonly description: string;
    readonly arguments: string[];
    readonly options: Option[];
    run(options: any): void;
    printHelp(options: any): void;
}
