const express = require('express');
const router = express.Router();
const db = require('../models');
const { isLoggedIn } = require('./middleware');

// retrieve specific file and all revisions from DB
// request body: fileId
router.get('/', async (req, res) => {
  try {
	const file = await db.File.findOne({
	  where: { id: req.body.fileId }
	});

	const revisions = await db.Revision.findAll({
	  where: {fileId: req.body.fileId}
	})

	return res.status(200).json({file,revisions});
  } catch (e) {
	console.error(e);
	// TODO: error handler
	return next(e);
  }
});

// Retrieve all files in a hierarchy tree
router.get('/nav', async (req, res) => {
  try {
	// retrieve all files from DB
	const files = await db.File.findAll({
	  where: {deleted: 0}
	});

	// create tree with files
	tree = buildHierarchy(files)

	return res.status(200).json(tree);
  } catch (e) {
	console.error(e);
	// TODO: error handler
	return next(e);
  }
});

// Create a new file
router.post('/', isLoggedIn, async (req, res, next) => {
  try {
	const newFile = await db.File.create({
	  content: JSON.stringify(req.body.content),
	  name: req.body.name,
	  parentId: req.body.parentId, // 0;
	  UserId: req.user.id,
	  isFolder: req.body.isFolder
	});
	// console.log(newFile);
	return res.status(200).json(newFile);
  } catch (e) {
	console.error(e);
	// TODO: error handler
	return next(e);
  }
});

// Update a file
// request body parameters: userId, fileId, content
// response body parameters: entriesUpdated
router.put('/', isLoggedIn, async (req, res, next) => {
  try {
	// Get old file content from DB
	const oldContent = await db.File.findOne({
	  where: { id: req.body.fileId }
	});

	// Insert old content into Revisions
	const revisionInsert = await db.Revision.create({
	  content: oldContent.content,
	  name: oldContent.name,
	  UserId: req.body.userId,
	  fileId: req.body.fileId,
	  isFolder: req.body.isFolder
	});

	// Insert New Content into Files
	const newFile = await db.File.update(
	  {content: req.body.content},
	  {where: {Id: req.body.fileId}
	});

	return res.status(200).json({'entriesUpdated': newFile[0]});
  } catch (e) {
	console.error(e);
	return next(e);
  }
});

// Delete a file
// request body parameters: fileId
router.delete('/:id', isLoggedIn, async (req, res, next) => {
  try {
	const file = await db.File.update(
	  {deleted: 1},
	  {where: { id: req.params.id }
	});

	// return res.status(200).json({'entriesDeleted': file});
	res.send(req.params.id);
  } catch (e) {
	console.error(e);
	// TODO: error handler
	return next(e);
  }
});

module.exports = router;

// Helper methods
//https://stackoverflow.com/questions/12831746/javascript-building-a-hierarchical-tree
function buildHierarchy(arry) {

    var roots = [], children = {};

    // find the top level nodes and hash the children based on parent
    for (var i = 0, len = arry.length; i < len; ++i) {
        var item = arry[i],
            p = item.parentId,
            target = !p ? roots : (children[p] || (children[p] = []));

        target.push(item.dataValues);
    }

    // function to recursively build the tree
    var findChildren = function(parent) {
        if (children[parent.id]) {
            parent.children = children[parent.id];
            for (var i = 0, len = parent.children.length; i < len; ++i) {
                findChildren(parent.children[i]);
            }
        }
    };

    // enumerate through to handle the case where there are multiple roots
    for (var i = 0, len = roots.length; i < len; ++i) {
        findChildren(roots[i]);
    }

	root = {
		"id": -1,
		"name":"Root-FRC-Folder",
		"toggled": "false",
		"children": roots,
		"isFolder": 0
	}
	console.log(root)
    return root;
}
