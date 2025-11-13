export interface ClaudeCodeInput {
  session_id?: string;
  transcript_path?: string;
  cwd?: string;
  workspace?: {
    current_dir?: string;
    project_dir?: string;
  };
  model?: {
    id?: string;
    display_name?: string;
  };
  version?: string;
  cost?: {
    total_cost_usd?: number;
    total_duration_ms?: number;
    total_api_duration_ms?: number;
    total_lines_added?: number;
    total_lines_removed?: number;
  };
  exceeds_200k_tokens?: boolean;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
  context?: {
    used_tokens?: number;
    max_tokens?: number;
  };
}

export interface PluginContext {
  input: ClaudeCodeInput;
  currentDir: string;
  dirName: string;
}

export interface PluginOptions {
  [key: string]: any;
}

export interface PluginConfig {
  name: string;
  icon?: string;
  color?: string;
  options?: PluginOptions;
}

export interface PluginResult {
  content: string;
  error?: string;
}

export interface Plugin {
  name: string;
  execute(context: PluginContext, config: PluginConfig): Promise<PluginResult> | PluginResult;
}
