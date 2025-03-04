/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 model.glb --transform 
Files: model.glb [2.14MB] > /Users/ankit/myWork/hackathon_projects/unfold_24/bullie_gen/src/assets/model-transformed.glb [235.08KB] (89%)
*/

import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { nodes, materials } = useGLTF('/model- .glb')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.mesh_0.geometry} material={nodes.mesh_0.material} />
    </group>
  )
}

useGLTF.preload('/model-transformed.glb')
