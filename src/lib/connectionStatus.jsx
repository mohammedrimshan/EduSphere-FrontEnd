'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export function ConnectionStatus({ peer, stream }) {
  const [status, setStatus] = useState({
    connected: false,
    hasLocalStream: false,
    hasRemoteStream: false,
    error: null
  })

  useEffect(() => {
    if (!peer) return

    const updateStatus = () => {
      setStatus(prev => ({
        ...prev,
        hasLocalStream: stream?.active ?? false,
        hasRemoteStream: peer._remoteStreams?.length > 0 ?? false
      }))
    }

    peer.on('connect', () => {
      setStatus(prev => ({ ...prev, connected: true }))
    })

    peer.on('close', () => {
      setStatus(prev => ({ ...prev, connected: false }))
    })

    peer.on('error', (err) => {
      setStatus(prev => ({ ...prev, error: err.message }))
    })

    peer.on('stream', () => {
      updateStatus()
    })

    // Initial status check
    updateStatus()

    return () => {
      peer.removeAllListeners()
    }
  }, [peer, stream])

  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>Connection Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span>Connection:</span>
          <Badge variant={status.connected ? "success" : "destructive"}>
            {status.connected ? (
              <><CheckCircle2 className="w-4 h-4 mr-1" /> Connected</>
            ) : (
              <><AlertCircle className="w-4 h-4 mr-1" /> Disconnected</>
            )}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span>Local Stream:</span>
          <Badge variant={status.hasLocalStream ? "success" : "destructive"}>
            {status.hasLocalStream ? (
              <><CheckCircle2 className="w-4 h-4 mr-1" /> Active</>
            ) : (
              <><AlertCircle className="w-4 h-4 mr-1" /> Inactive</>
            )}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span>Remote Stream:</span>
          <Badge variant={status.hasRemoteStream ? "success" : "destructive"}>
            {status.hasRemoteStream ? (
              <><CheckCircle2 className="w-4 h-4 mr-1" /> Receiving</>
            ) : (
              <><AlertCircle className="w-4 h-4 mr-1" /> Waiting</>
            )}
          </Badge>
        </div>

        {status.error && (
          <div className="text-red-500 text-sm mt-2">
            Error: {status.error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

