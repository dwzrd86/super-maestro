/**
 * tmux session management.
 *
 * Handles:
 * - Session discovery
 * - Session creation/destruction
 * - Terminal I/O
 * - Pane management
 */

import { $ } from 'bun';

export interface TmuxSession {
  id: string;
  name: string;
  created: Date;
  attached: boolean;
  width: number;
  height: number;
}

export interface TmuxPane {
  id: string;
  sessionId: string;
  active: boolean;
  pid: number;
  currentPath: string;
}

export class TmuxManager {
  private sessionPrefix = 'agentforge-';

  /**
   * Check if tmux is available on the system.
   */
  async isAvailable(): Promise<boolean> {
    try {
      await $`which tmux`.quiet();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List all tmux sessions (optionally filtered to AgentForge sessions).
   */
  async listSessions(onlyAgentForge = false): Promise<TmuxSession[]> {
    try {
      const result = await $`tmux list-sessions -F "#{session_id}|#{session_name}|#{session_created}|#{session_attached}|#{session_width}|#{session_height}"`.text();

      const sessions: TmuxSession[] = result
        .trim()
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => {
          const [id, name, created, attached, width, height] = line.split('|');
          return {
            id,
            name,
            created: new Date(parseInt(created, 10) * 1000),
            attached: attached === '1',
            width: parseInt(width, 10),
            height: parseInt(height, 10),
          };
        });

      if (onlyAgentForge) {
        return sessions.filter((s) => s.name.startsWith(this.sessionPrefix));
      }

      return sessions;
    } catch (error) {
      // No sessions or tmux not running
      console.log('[tmux] No sessions found or tmux server not running');
      return [];
    }
  }

  /**
   * Create a new tmux session.
   */
  async createSession(name?: string): Promise<TmuxSession> {
    const sessionName = name || `${this.sessionPrefix}${Date.now()}`;

    await $`tmux new-session -d -s ${sessionName}`.quiet();

    // Get the created session info
    const sessions = await this.listSessions();
    const session = sessions.find((s) => s.name === sessionName);

    if (!session) {
      throw new Error(`Failed to create session: ${sessionName}`);
    }

    console.log(`[tmux] Created session: ${sessionName}`);
    return session;
  }

  /**
   * Kill a tmux session.
   */
  async killSession(sessionId: string): Promise<void> {
    await $`tmux kill-session -t ${sessionId}`.quiet();
    console.log(`[tmux] Killed session: ${sessionId}`);
  }

  /**
   * Send input to a tmux session.
   */
  async sendInput(sessionId: string, input: string): Promise<void> {
    // Send keys to the session
    await $`tmux send-keys -t ${sessionId} ${input}`.quiet();
  }

  /**
   * Send a command to a tmux session (with Enter key).
   */
  async sendCommand(sessionId: string, command: string): Promise<void> {
    await $`tmux send-keys -t ${sessionId} ${command} Enter`.quiet();
    console.log(`[tmux] Sent command to ${sessionId}: ${command}`);
  }

  /**
   * Capture the current pane content.
   */
  async capturePane(
    sessionId: string,
    startLine = -1000,
    endLine = 1000
  ): Promise<string> {
    try {
      const result = await $`tmux capture-pane -t ${sessionId} -p -S ${startLine} -E ${endLine}`.text();
      return result;
    } catch (error) {
      console.error(`[tmux] Failed to capture pane for ${sessionId}:`, error);
      return '';
    }
  }

  /**
   * Get information about panes in a session.
   */
  async listPanes(sessionId: string): Promise<TmuxPane[]> {
    try {
      const result = await $`tmux list-panes -t ${sessionId} -F "#{pane_id}|#{pane_active}|#{pane_pid}|#{pane_current_path}"`.text();

      return result
        .trim()
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => {
          const [id, active, pid, currentPath] = line.split('|');
          return {
            id,
            sessionId,
            active: active === '1',
            pid: parseInt(pid, 10),
            currentPath,
          };
        });
    } catch (error) {
      console.error(`[tmux] Failed to list panes for ${sessionId}:`, error);
      return [];
    }
  }

  /**
   * Resize a session's window.
   */
  async resizeWindow(
    sessionId: string,
    width: number,
    height: number
  ): Promise<void> {
    try {
      await $`tmux resize-window -t ${sessionId} -x ${width} -y ${height}`.quiet();
    } catch (error) {
      // Resize may fail if attached, that's okay
      console.log(`[tmux] Resize may have failed for ${sessionId}`);
    }
  }
}
