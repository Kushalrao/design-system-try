// Figma Plugin: Design Tokens Sync
// Main plugin code that handles Variables API access and GitHub integration

// Show the plugin UI
figma.showUI(__html__, { width: 320, height: 500 });

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  try {
    switch (msg.type) {
      case 'get-variables':
        await handleGetVariables();
        break;
        
      case 'export-to-github':
        await handleExportToGitHub(msg.githubToken, msg.repoOwner, msg.repoName);
        break;
        
      default:
        console.log('Unknown message type:', msg.type);
    }
  } catch (error) {
    console.error('Plugin error:', error);
    figma.ui.postMessage({
      type: 'export-error',
      error: error.message
    });
  }
};

// Get variables from Figma Variables API
async function handleGetVariables() {
  try {
    figma.ui.postMessage({
      type: 'loading',
      message: 'Loading variables...'
    });

    // Get all local variables
    const variables = await figma.variables.getLocalVariablesAsync();
    
    // Transform to our token format
    const tokens = transformVariablesToTokens(variables);
    
    figma.ui.postMessage({
      type: 'variables-loaded',
      data: {
        count: variables.length,
        tokens: tokens
      }
    });
    
  } catch (error) {
    figma.ui.postMessage({
      type: 'export-error',
      error: `Failed to load variables: ${error.message}`
    });
  }
}

// Export variables to GitHub
async function handleExportToGitHub(githubToken, repoOwner, repoName) {
  try {
    figma.ui.postMessage({
      type: 'loading',
      message: 'Exporting to GitHub...'
    });

    // Get variables
    const variables = await figma.variables.getLocalVariablesAsync();
    const tokens = transformVariablesToTokens(variables);
    
    // Commit to GitHub
    await commitToGitHub(githubToken, repoOwner, repoName, tokens);
    
    figma.ui.postMessage({
      type: 'export-success',
      data: {
        count: variables.length
      }
    });
    
  } catch (error) {
    figma.ui.postMessage({
      type: 'export-error',
      error: `GitHub export failed: ${error.message}`
    });
  }
}

// Transform Figma variables to our token format
function transformVariablesToTokens(variables) {
  const tokens = {
    color: {},
    typography: {},
    spacing: {},
    borderRadius: {},
    shadow: {},
    opacity: {}
  };

  variables.forEach(variable => {
    const name = sanitizeVariableName(variable.name);
    const category = determineTokenCategory(variable.name, variable.resolvedType);
    
    // Process each mode
    Object.entries(variable.valuesByMode).forEach(([modeId, value]) => {
      const transformedValue = transformVariableValue(variable.resolvedType, value);
      
      if (transformedValue !== null) {
        tokens[category][name] = {
          value: transformedValue,
          type: category,
          variableId: variable.key,
          originalName: variable.name,
          resolvedType: variable.resolvedType
        };
      }
    });
  });

  return tokens;
}

// Determine token category based on variable name and type
function determineTokenCategory(name, type) {
  const lowerName = name.toLowerCase();
  
  switch (type) {
    case 'COLOR':
      return 'color';
    case 'FLOAT':
      if (lowerName.includes('spacing') || lowerName.includes('padding') || lowerName.includes('margin')) {
        return 'spacing';
      } else if (lowerName.includes('radius') || lowerName.includes('corner')) {
        return 'borderRadius';
      } else if (lowerName.includes('opacity') || lowerName.includes('alpha')) {
        return 'opacity';
      }
      return 'spacing'; // Default for FLOAT
    case 'STRING':
      if (lowerName.includes('font') || lowerName.includes('typography') || lowerName.includes('text')) {
        return 'typography';
      }
      return 'typography'; // Default for STRING
    default:
      return 'spacing';
  }
}

// Transform variable value based on type
function transformVariableValue(type, value) {
  switch (type) {
    case 'COLOR':
      return colorToHex(value);
    case 'FLOAT':
      return parseFloat(value);
    case 'STRING':
      return value;
    case 'BOOLEAN':
      return Boolean(value);
    default:
      return value;
  }
}

// Convert Figma color to hex
function colorToHex(color) {
  if (!color || typeof color !== 'object') return null;
  
  const { r, g, b, a = 1 } = color;
  const toHex = (n) => Math.round(n * 255).toString(16).padStart(2, '0');
  
  if (a < 1) {
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
  }
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Sanitize variable name for Swift
function sanitizeVariableName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/^color/, '')
    .replace(/^spacing/, '')
    .replace(/^typography/, '')
    .replace(/^borderradius/, '');
}

// Commit tokens to GitHub
async function commitToGitHub(githubToken, repoOwner, repoName, tokens) {
  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/tokens/figma-tokens.json`;
  
  // Get existing file SHA (if exists)
  let existingSha = null;
  try {
    const existingResponse = await fetch(url, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (existingResponse.ok) {
      const existingData = await existingResponse.json();
      existingSha = existingData.sha;
    }
  } catch (error) {
    // File doesn't exist yet, that's okay
  }

  // Prepare commit data
  const content = JSON.stringify(Object.assign({
    $metadata: {
      generatedAt: new Date().toISOString(),
      source: 'figma-plugin',
      method: 'variables-api',
      note: 'Generated from Figma Variables API via plugin'
    }
  }, tokens), null, 2);

  const encodedContent = btoa(content);
  
  const commitData = {
    message: `Update design tokens from Figma - ${new Date().toISOString()}`,
    content: encodedContent,
    branch: 'main'
  };

  if (existingSha) {
    commitData.sha = existingSha;
  }

  // Commit to GitHub
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commitData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`GitHub API error: ${errorData.message || response.statusText}`);
  }

  const result = await response.json();
  console.log('Successfully committed to GitHub:', result.commit.html_url);
}
