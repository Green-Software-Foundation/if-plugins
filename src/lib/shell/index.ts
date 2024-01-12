import {spawnSync, SpawnSyncReturns} from 'child_process';
import {loadAll, dump} from 'js-yaml';
import {z} from 'zod';

import {ModelPluginInterface} from '../../interfaces';
import {KeyValuePair, ModelParams} from '../../types/common';

import {validate} from '../../util/validations';

export class ShellModel implements ModelPluginInterface {
  /**
   * Configures the ShellModel Plugin.
   */
  public async configure(): Promise<ModelPluginInterface> {
    return this;
  }

  /**
   * Calculate the total emissions for a list of inputs.
   */
  public async execute(inputs: ModelParams[]): Promise<any[]> {
    const inputAsString: string = dump(inputs, {indent: 2});

    const command = this.validateSingleInput(inputs[0]).command;
    const results = this.runModelInShell(inputAsString, command);

    return results.outputs;
  }

  /**
   * Checks for required fields in input.
   */
  private validateSingleInput(input: ModelParams) {
    const schema = z.object({
      command: z.string().optional(),
    });

    return validate(schema, input);
  }

  /**
   * Runs the model in a shell. Spawns a child process to run an external IMP,
   * an executable with a CLI exposing two methods: `--execute` and `--impl`.
   * The shell command then calls the `--command` method passing var impl as the path to the desired impl file.
   */
  private runModelInShell(input: string, command: string): KeyValuePair {
    try {
      const [executable, ...args] = command.split(' ');

      const result: SpawnSyncReturns<string> = spawnSync(executable, args, {
        input,
        encoding: 'utf8',
      });

      const outputs = loadAll(result.stdout);

      return {outputs};
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
