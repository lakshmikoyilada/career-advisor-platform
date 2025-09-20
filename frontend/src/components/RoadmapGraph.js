// frontend/src/components/RoadmapGraph.js
import React, { useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  useNodesState,
  useEdgesState,
  useReactFlow,
  getSmoothStepPath
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

// Custom node component for better tooltips
const CustomNode = ({ data }) => {
  const nodeId = `node-${data.id}`;
  
  return (
    <>
      <div 
        id={nodeId}
        style={{
          ...baseItemStyle,
          ...(data.level ? levelStyles[data.level] : {}),
          ...(data.completed ? completedStyle : {})
        }}
      >
        {data.title}
      </div>
      <Tooltip anchorId={nodeId} content={data.description} />
    </>
  );
};

/*
  RoadmapGraph
  Props:
    - career: string
    - roadmap: {
        Beginner: [{ name|skill, status }],
        Intermediate: [...],
        Advanced: [...],
        'Mini Projects': [{ name|project, status }],
        'Main Projects': [...]
      }
*/

// Color scheme for different levels
const levelStyles = {
  'Beginner': {
    border: '2px solid #3b82f6',
    background: '#e0f2fe',
    color: '#075985',
  },
  'Intermediate': {
    border: '2px solid #10b981',
    background: '#d1fae5',
    color: '#065f46',
  },
  'Advanced': {
    border: '2px solid #8b5cf6',
    background: '#ede9fe',
    color: '#5b21b6',
  },
  'Mini Projects': {
    border: '2px solid #f59e0b',
    background: '#fef3c7',
    color: '#92400e',
  },
  'Main Projects': {
    border: '2px solid #ec4899',
    background: '#fce7f3',
    color: '#9d174d',
  }
};

const baseItemStyle = {
  fontWeight: 600,
  padding: '8px 12px',
  borderRadius: 12,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
  }
};

const completedStyle = {
  opacity: 0.7,
  textDecoration: 'line-through',
  filter: 'saturate(0.5)'
};

function getItemData(val) {
  if (!val) return { title: '-', description: '' };
  return {
    title: val.skill || val.project || val.name || (typeof val === 'string' ? val : '-'),
    description: val.description || 'No description available',
    completed: val.completed || false
  };
}

const columns = [
  { key: 'Beginner', x: 200 },
  { key: 'Intermediate', x: 500 },
  { key: 'Advanced', x: 800 },
  { key: 'Mini Projects', x: 1100 },
  { key: 'Main Projects', x: 1400 },
];

export default function RoadmapGraph({ career, roadmap }) {
  const [completedItems, setCompletedItems] = useState({});
  
  const toggleItemStatus = (itemId) => {
    setCompletedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };
  const { nodes, edges } = useMemo(() => {
    const ns = [];
    const es = [];

    // Root career node centered at the top
    ns.push({
      id: 'career',
      type: 'custom',
      position: { x: 800, y: 40 },
      data: { 
        ...getItemData(career),
        level: 'Beginner',
        id: 'career',
        completed: false
      },
      style: {
        ...baseItemStyle,
        background: '#1e40af',
        color: 'white',
        padding: '12px 24px',
        fontSize: '1.25rem',
        fontWeight: 700,
        border: 'none',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }
    });

    const colTopY = 140;
    const rowGap = 80;

    columns.forEach((col) => {
      const items = roadmap?.[col.key] || [];

      // Category node
      const catId = `cat-${col.key}`;
      ns.push({
        id: catId,
        position: { x: col.x, y: colTopY },
        type: 'custom',
        data: { 
          ...getItemData({ name: col.key }),
          id: catId,
          level: col.key,
          completed: false
        },
        style: {
          ...baseItemStyle,
          ...levelStyles[col.key],
          padding: '10px 20px',
          fontWeight: 700,
          cursor: 'default'
        }
      });

      // Edge from career to category
      es.push({
        id: `e-career-${catId}`,
        source: 'career',
        target: catId,
        type: 'smoothstep',
        markerEnd: { 
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#1f2937'  // Darker gray
        },
        style: {
          stroke: '#1f2937',  // Darker gray
          strokeWidth: 2.5,
        },
        animated: true
      });

      // Item nodes
      items.forEach((it, idx) => {
        const itemId = `${col.key}-${idx}`;
        const itemData = getItemData(it);
        const isCompleted = completedItems[itemId] || itemData.completed;
        
        ns.push({
          id: itemId,
          type: 'custom',
          position: { x: col.x, y: colTopY + (idx + 1) * rowGap },
          data: {
            ...itemData,
            id: itemId,
            level: col.key,
            completed: isCompleted,
            onClick: () => toggleItemStatus(itemId)
          },
          style: {
            ...baseItemStyle,
            ...levelStyles[col.key],
            ...(isCompleted ? completedStyle : {})
          }
        });
        // dotted edge from item to category (like the screenshot)
        es.push({
          id: `e-${itemId}-${catId}`,
          source: itemId,
          target: catId,
          type: 'smoothstep',
          markerEnd: { 
            type: MarkerType.ArrowClosed,
            width: 18,  // Slightly larger
            height: 18,  // Slightly larger
            color: '#4b5563'  // Darker gray
          },
          style: { 
            stroke: '#4b5563',  // Darker gray
            strokeWidth: 2,  // Slightly thicker
            strokeDasharray: '4 2' 
          },
          animated: true
        });
      });
    });

    // Connect categories left-to-right with curved lines
    for (let i = 0; i < columns.length - 1; i++) {
      const currentLevel = columns[i].key;
      const nextLevel = columns[i + 1].key;
      const a = `cat-${currentLevel}`;
      const b = `cat-${nextLevel}`;
      
      // Add text label for the flow direction
      const label = `${currentLevel} → ${nextLevel}`;
      
      // Main flow edge with arrow
      es.push({
        id: `e-${a}-${b}`,
        source: a,
        target: b,
        type: 'custom',  // Use our custom edge type
        markerEnd: `url(#arrowhead-${a}-${b})`,
        style: { 
          strokeWidth: 4,
          stroke: '#1e40af',
          strokeDasharray: '0',
          fill: 'none',
        },
        animated: true,
        label: label,
        labelStyle: {
          fill: '#1e40af',
          fontWeight: 600,
          fontSize: '12px',
        },
        labelBgStyle: {
          fill: '#f8fafc',
          fillOpacity: 0.9,
          stroke: '#1e40af',
          strokeWidth: 1,
          rx: 4,
          ry: 4,
          padding: 4,
        },
      });
      
      // Add arrowhead definition to the SVG
      const arrowId = `arrowhead-${a}-${b}`;
      if (typeof window !== 'undefined' && !document.getElementById(arrowId)) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', arrowId);
        marker.setAttribute('viewBox', '0 0 10 10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '5');
        marker.setAttribute('markerWidth', '6');
        marker.setAttribute('markerHeight', '6');
        marker.setAttribute('orient', 'auto');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
        path.setAttribute('fill', '#1e40af');
        
        marker.appendChild(path);
        defs.appendChild(marker);
        
        // Add to the first SVG element in the document
        const svg = document.querySelector('svg');
        if (svg) {
          const existingDefs = svg.querySelector('defs');
          if (existingDefs) {
            existingDefs.appendChild(marker);
          } else {
            svg.insertBefore(defs, svg.firstChild);
          }
        }
      }
      
      // Add a subtle glow effect to make it more visible
      es.push({
        id: `glow-${a}-${b}`,
        source: a,
        target: b,
        type: 'smoothstep',
        style: {
          stroke: '#93c5fd',
          strokeWidth: 12,
          strokeOpacity: 0.3,
          strokeLinecap: 'round',
        },
        zIndex: -1,  // Send to back
      });
    }

    return { nodes: ns, edges: es };
  }, [career, roadmap]);

  // Custom edge component to support labels
  const CustomEdge = (props) => {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      sourcePosition: props.sourcePosition || 'right',
      targetX: props.targetX,
      targetY: props.targetY,
      targetPosition: props.targetPosition || 'left',
      borderRadius: 8,
    });

    return (
      <>
        <path
          id={props.id}
          style={props.style}
          className="react-flow__edge-path"
          d={edgePath}
          markerEnd={props.markerEnd}
        />
        {props.label && (
          <g transform={`translate(${labelX} ${labelY})`}>
            <rect
              x={-50}
              y={-15}
              width={100}
              height={24}
              rx={4}
              fill="#f8fafc"
              stroke="#1e40af"
              strokeWidth={1}
              style={props.labelBgStyle}
            />
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fill: '#1e40af',
                fontWeight: 600,
                fontSize: '12px',
                pointerEvents: 'none',
              }}
            >
              {props.label}
            </text>
          </g>
        )}
      </>
    );
  };

  const edgeTypes = {
    custom: CustomEdge,
  };

  return (
    <div style={{ 
      height: 'calc(100vh - 200px)', 
      width: '100%', 
      borderRadius: 12, 
      overflow: 'hidden', 
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        nodeTypes={{ custom: CustomNode }}
        edgeTypes={edgeTypes}
        fitView 
        fitViewOptions={{ padding: 0.4 }}
        defaultViewport={{ zoom: 0.9 }}
        nodesDraggable={false}
        nodesConnectable={false}
        onNodeClick={(e, node) => {
          if (node.data.onClick) {
            node.data.onClick();
          }
        }}
        edgeUpdaterRadius={20}
      >
        <MiniMap 
          pannable 
          zoomable 
          nodeStrokeWidth={3}
          nodeColor={node => {
            if (node.id === 'career') return '#1e40af';
            return levelStyles[node.data.level]?.border?.replace('2px solid ', '') || '#94a3b8';
          }}
          nodeBorderRadius={6}
        />
        <Controls position="top-left" />
        <Background gap={24} color="#e2e8f0" variant="dots" />
      </ReactFlow>
    </div>
  );
}
