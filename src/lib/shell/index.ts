import {spawnSync, SpawnSyncReturns} from 'child_process';
import {loadAll, dump} from 'js-yaml';
import {z} from 'zod';

import {PluginInterface} from '../../interfaces';
import {ConfigParams, PluginParams} from '../../types/common';

import {validate} from '../../util/validations';
import {ERRORS} from '../../util/errors';

const {InputValidationError} = ERRORS;

export const Shell = (globalConfig: ConfigParams): PluginInterface => {
  const metadata = {
    kind: 'execute',
  };

  /**
   * Calculate the total emissions for a list of inputs.
   */
  const execute = async (
    inputs: PluginParams[],
    config?: ConfigParams
  ): Promise<any[]> => {
    const inputWithConfig: PluginParams = Object.assign(
      {},
      inputs[0],
      globalConfig,
      config
    );
    const command = validateSingleInput(inputWithConfig).command;
    const inputAsString: string = dump(inputs, {indent: 2});
    const results = runModelInShell(inputAsString, command);

    return results.outputs;
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (input: PluginParams) => {
    const schema = z.object({
      command: z.string(),
    });

    return validate<z.infer<typeof schema>>(schema, input);
  };

  /**
   * Runs the model in a shell. Spawns a child process to run an external IMP,
   * an executable with a CLI exposing two methods: `--execute` and `--impl`.
   * The shell command then calls the `--command` method passing var impl as the path to the desired impl file.
   */
  const runModelInShell = (input: string, command: string) => {
    try {
      const [executable, ...args] = command.split(' ');

      const result: SpawnSyncReturns<string> = spawnSync(executable, args, {
        input,
        encoding: 'utf8',
      });
      const outputs = loadAll(result.stdout);

      return {outputs: outputs};
    } catch (error: any) {
      throw new InputValidationError(error.message);
    }
  };

  return {
    metadata,
    execute,
  };
};
