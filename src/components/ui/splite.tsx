'use client'

import { Suspense, lazy } from 'react'
import {
  WebGLSceneBoundary,
  WebGLSceneFallback,
  useWebGLSupport,
} from '@/components/ui/webgl-scene-fallback'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  const isWebGLSupported = useWebGLSupport()
  const fallback = (
    <WebGLSceneFallback
      className={className}
      title="Notebook shelf preview unavailable"
      description="This device cannot start the 3D notebook preview, but you can still browse templates and create notebooks."
    />
  )

  if (isWebGLSupported === false) {
    return fallback
  }

  return (
    <WebGLSceneBoundary fallback={fallback}>
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <span className="loader"></span>
          </div>
        }
      >
        <Spline
          scene={scene}
          className={className}
        />
      </Suspense>
    </WebGLSceneBoundary>
  )
}
