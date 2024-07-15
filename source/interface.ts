export interface SupabaseProps {
  guild?: string;
  status?: {
    channel: string;
    message: string;
  }
  nitrado?: {
    requiredToken: string;
    optionalToken: string;
  }
}

export interface InputProps {
  username: string;
  reason: string;
  guild: string;
  admin?: string;
}

export interface TokenProps {
  data: {
    token: {
      id: number;
      user: {
        id: number;
        username: string;
      },
      expires_at: number;
      scopes: string[];
    }
  }
}

export interface GameserverProps {
  data: {
    gameserver: {
      status: string;
      username: string;
      service_id: string;
      game_specific: {
        path: string;
        log_files: string[]
      },
      query?: {
        server_name?: string;
        player_current?: number;
        player_max?: number;
      }
    }
  }
}

export interface ServiceProps {
  data: {
    services: {
      id: number;
      type: string;

      details: {
        address: string;
        name: string;
        game: string;
        folder_short: string;
      }
      suspend_date: string;
    }[]
  }
}

export interface PlayerActionProps {
  data: {
    message: string;
    data: {
      identifier: string[]
    }
  }
}

export interface ServerActionProps {
  data: {
    status: string;
    message: string;
  }
}