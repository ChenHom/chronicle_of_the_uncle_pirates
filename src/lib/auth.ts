import { NextAuthOptions } from 'next-auth'

// LINE Provider 設定
const LineProvider = {
  id: 'line',
  name: 'LINE',
  type: 'oauth' as const,
  authorization: {
    url: 'https://access.line.me/oauth2/v2.1/authorize',
    params: {
      scope: 'profile openid',
      bot_prompt: 'normal'
    }
  },
  token: 'https://api.line.me/oauth2/v2.1/token',
  userinfo: 'https://api.line.me/v2/profile',
  clientId: process.env.LINE_CLIENT_ID,
  clientSecret: process.env.LINE_CLIENT_SECRET,
  profile(profile: { userId: string; displayName: string; pictureUrl?: string }) {
    return {
      id: profile.userId,
      name: profile.displayName,
      image: profile.pictureUrl,
      email: null // LINE 不一定提供 email
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [LineProvider],
  
  callbacks: {
    async jwt({ token, account, profile }) {
      // 首次登入時從 LINE profile 取得資訊
      if (account && profile) {
        const lineProfile = profile as { userId?: string; displayName?: string; pictureUrl?: string }
        token.lineUserId = lineProfile.userId || account.providerAccountId
        token.lineDisplayName = lineProfile.displayName
        token.linePictureUrl = lineProfile.pictureUrl
      }
      
      return token
    },
    
    async session({ session, token }) {
      // 將 LINE 資訊加入 session
      if (token) {
        session.user.id = token.lineUserId as string
        session.user.lineUserId = token.lineUserId as string
        session.user.lineDisplayName = token.lineDisplayName as string
        session.user.linePictureUrl = token.linePictureUrl as string
      }
      
      return session
    },
    
    async signIn({ profile }) {
      // 這裡可以加入自訂的登入驗證邏輯
      // 例如檢查使用者是否在授權清單中
      
      const lineProfile = profile as { userId?: string; displayName?: string } | null
      console.log('LINE Login attempt:', {
        userId: lineProfile?.userId,
        displayName: lineProfile?.displayName
      })
      
      return true // 暫時允許所有使用者登入
    }
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 小時
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
}

// 擴展 NextAuth 型別定義
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      lineUserId: string
      lineDisplayName: string
      linePictureUrl?: string
    }
  }
  
  interface User {
    lineUserId?: string
    lineDisplayName?: string
    linePictureUrl?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    lineUserId?: string
    lineDisplayName?: string
    linePictureUrl?: string
  }
}