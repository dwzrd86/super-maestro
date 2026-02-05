/**
 * Database Types (Supabase Generated)
 *
 * This file should be regenerated using:
 * npm run db:generate
 *
 * For now, this is a stub that will be replaced when the database is set up.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          avatar_url: string | null;
          owner_id: string;
          plan: 'free' | 'pro' | 'enterprise';
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['teams']['Row'],
          'id' | 'created_at' | 'updated_at'
        > &
          Partial<Pick<Database['public']['Tables']['teams']['Row'], 'id'>>;
        Update: Partial<Database['public']['Tables']['teams']['Row']>;
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          preferences: Json;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
        };
        Insert: Omit<
          Database['public']['Tables']['user_profiles']['Row'],
          'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['user_profiles']['Row']>;
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member' | 'viewer';
          invited_by: string | null;
          invited_at: string | null;
          joined_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['team_members']['Row'],
          'id' | 'joined_at' | 'updated_at'
        > &
          Partial<Pick<Database['public']['Tables']['team_members']['Row'], 'id'>>;
        Update: Partial<Database['public']['Tables']['team_members']['Row']>;
      };
      agents: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          model: string;
          system_prompt: string | null;
          temperature: number;
          max_tokens: number;
          status: 'idle' | 'running' | 'paused' | 'error' | 'offline';
          last_active_at: string | null;
          team_id: string;
          created_by: string;
          tags: string[];
          config: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['agents']['Row'],
          'id' | 'created_at' | 'updated_at'
        > &
          Partial<Pick<Database['public']['Tables']['agents']['Row'], 'id'>>;
        Update: Partial<Database['public']['Tables']['agents']['Row']>;
      };
      agent_sessions: {
        Row: {
          id: string;
          agent_id: string;
          tmux_session_name: string | null;
          pid: number | null;
          status: 'active' | 'completed' | 'failed' | 'terminated';
          exit_code: number | null;
          working_directory: string | null;
          environment: Json;
          playbook_id: string | null;
          current_task_index: number | null;
          started_at: string;
          ended_at: string | null;
        };
        Insert: Omit<
          Database['public']['Tables']['agent_sessions']['Row'],
          'id' | 'started_at'
        > &
          Partial<Pick<Database['public']['Tables']['agent_sessions']['Row'], 'id'>>;
        Update: Partial<Database['public']['Tables']['agent_sessions']['Row']>;
      };
      playbooks: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          version: string;
          is_published: boolean;
          team_id: string;
          created_by: string;
          default_agent_id: string | null;
          variables: Json;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['playbooks']['Row'],
          'id' | 'created_at' | 'updated_at'
        > &
          Partial<Pick<Database['public']['Tables']['playbooks']['Row'], 'id'>>;
        Update: Partial<Database['public']['Tables']['playbooks']['Row']>;
      };
      playbook_tasks: {
        Row: {
          id: string;
          playbook_id: string;
          name: string;
          description: string | null;
          type: 'command' | 'prompt' | 'condition' | 'loop' | 'parallel';
          order: number;
          parent_task_id: string | null;
          config: Json;
          timeout_seconds: number | null;
          retry_count: number;
          retry_delay_seconds: number;
          condition: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['playbook_tasks']['Row'],
          'id' | 'created_at' | 'updated_at'
        > &
          Partial<Pick<Database['public']['Tables']['playbook_tasks']['Row'], 'id'>>;
        Update: Partial<Database['public']['Tables']['playbook_tasks']['Row']>;
      };
      playbook_runs: {
        Row: {
          id: string;
          playbook_id: string;
          agent_id: string;
          session_id: string | null;
          variables: Json;
          status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
          current_task_id: string | null;
          task_results: Json;
          output: Json;
          error: string | null;
          started_at: string;
          completed_at: string | null;
        };
        Insert: Omit<
          Database['public']['Tables']['playbook_runs']['Row'],
          'id' | 'started_at'
        > &
          Partial<Pick<Database['public']['Tables']['playbook_runs']['Row'], 'id'>>;
        Update: Partial<Database['public']['Tables']['playbook_runs']['Row']>;
      };
      messages: {
        Row: {
          id: string;
          session_id: string;
          role: 'system' | 'user' | 'assistant' | 'tool';
          type:
            | 'chat'
            | 'command'
            | 'output'
            | 'error'
            | 'status'
            | 'tool_call'
            | 'tool_result'
            | 'heartbeat';
          content: string;
          tool_name: string | null;
          tool_input: Json | null;
          tool_output: Json | null;
          metadata: Json;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['messages']['Row'],
          'id' | 'created_at'
        > &
          Partial<Pick<Database['public']['Tables']['messages']['Row'], 'id'>>;
        Update: Partial<Database['public']['Tables']['messages']['Row']>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
