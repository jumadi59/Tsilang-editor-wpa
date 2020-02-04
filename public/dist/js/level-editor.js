const Tsilang = function (options) {
	var tts = new TtsEditor({
		callbackDone: saved
	});
	tts.createView();

	function findLevel(params, params2) {
		return (params.row_count === params2.data.row_count && params.column_count === params2.data.column_count);
	}

	function findCategory(params, params2) {
		return (params.row_count === params2.data.row_count && params.column_count === params2.data.column_count);
	}

	function saved(result) {
		dbLevel.find(result, (value) => dbLevel.update(result, value.id).then(() =>
				Alert.message('Berhasil di simpan!')),
			() => dbLevel.insert(result).then(() => {
				Alert.message('Berhasil di simpan!');
			}));
	}

	function removed(id, callback) {
		dbLevel.get(id).then((result) => {
			if (result) {
				let level = result.data.level;
				let rowCount = result.data.row_count;
				let columnCount = result.data.column_count;
				dbLevel.delete(id).then(() => {

					dbLevel.getAll().then((results) => {
						var filter = results.filter(value => value.data.level > level && rowCount === value.data.row_count && columnCount === value.data.column_count);
						console.log('getAll ok ' + filter.length);
						if (filter.length === 0) {
							$('.__tts_tabs_levels .grid')
								.find('span[data-id="' + id + '"]')
								.parent().remove();
							if (typeof callback === "function") {
								callback.apply();
							}
						}
						filter.forEach((v, i) => {
							var data = {
								'level': v.data.level - 1,
								'row_count': v.data.row_count,
								'column_count': v.data.column_count,
								'tsilang': v.data.tsilang
							}
							dbLevel.update(data, v.id).then(() => {
								if (i === filter.length - 1) {
									levels(result.data.column_count, result.data.row_count);
									if (typeof callback === "function") {
										callback.apply();
									}
								}
							});
						});
					});
				});

			}
		});

	}

	function loadDb() {
		dbCategory.getAll().then(categories => {
			var htmlTab = '';
			categories.forEach((category, i) => {
				var a = (i === 0) ? 'class="active"' : '';
				var result = category.data;
				var id = result.column_count + 'x' + result.row_count;
				htmlTab += `<li class="tab" data-id="${category.id}"><a href="#${id}">${id}</a></li>`;
				$('.__tts_tabs_levels').append('<div id="' + id + '" class="__tts_levels"></div>');
				levels(result.column_count, result.row_count);
			});
			htmlTab += `<li class="tab" id="add-tab-category"><a href="#add-category"><i class="fa fa-plus"></i></a></li>`;
			$('.__tts_tabs_levels').append('<div id="add-category" class="__tts_levels"></div>');

			$('.__tts_tabs_levels .tabs').html(htmlTab).tabs({
				onShow: function (params, content) {

					if (typeof $(params) !== "undefined") {
						let find = params.find('.button.active');
						var x = (typeof $(find).length > 0) ? $(find)[0].offsetLeft : params[0].scrollWidth;
						x = x - (params.width() / 2);
						if (x > 0) {
							$(params).animate({
								scrollLeft: x
							}, x * 2);
						}
					}
					if ($(params).attr('id') === 'add-category') {
						$('#dialog-create-category').visible();
					}
				}
			});
		});
	}

	function createCategory(columnCount, rowCount, callback) {
		dbCategory.insert({
			'column_count': columnCount,
			'row_count': rowCount
		}).then(() => {
			dbCategory.find({
				column_count: columnCount,
				row_count: rowCount
			}, (value) => {
				if (value) {
					let id = columnCount + 'x' + rowCount;
					$('#add-tab-category')
						.attr('data-id', value.id)
						.html('<a href="#' + id + '">' + id + '</a>')
						.removeAttr('id');
					$('#add-category.__tts_levels').attr('id', id);
					levels(columnCount, rowCount);

					$('.__tts_tabs_levels .tabs').append(`<li class="tab" id="add-tab-category"><a href="#add-category"><i class="fa fa-plus"></i></a></li>`);
					$('.__tts_tabs_levels').append('<div id="add-category" class="__tts_levels"></div>');
					$('.__tts_tabs_levels .tabs').find('a[href="#' + id + '"]').trigger('click');
					if (typeof callback === "function") {
						callback();
					}
				}
			});
		});
	}

	function removeCategory(id, callback) {
		dbCategory.get(id).then((data) => {
			if (data) {
				dbCategory.delete(id).then(() => {
					dbLevel.getAll().then((values) => {
						let filter = values.filter((value) => findLevel(data.data, value));
						if (filter.length === 0) {
							$('.__tts_tabs_levels .tabs').find('li.tab[data-id="' + id + '"]').remove();
							$('.__tts_tabs_levels #' + data.data.column_count + 'x' + data.data.row_count).remove();
							let tabs = $('.__tts_tabs_levels .tabs').find('li.tab');
							let current = (tabs.length > 1) ? tabs.length - 2 : 0;
							$(tabs[current]).find('a').trigger('click');
							if (typeof callback === "function") {
								callback();
							}
						}
						filter.forEach((value, i) => {
							dbLevel.delete(value.id).then(() => {
								if (i === filter.length - 1) {
									$('.__tts_tabs_levels .tabs').find('li.tab[data-id="' + id + '"]').remove();
									$('__tts_tabs_levels #' + data.data.column_count + 'x' + data.data.row_count).remove();
									$('.__tts_tabs_levels .tabs').find('a[href="#' + id + '"]').trigger('click');
									if (typeof callback === "function") {
										callback();
									}
								}
							});
						});
					});
				});
			}
		})
	}

	function levels(columnCount, rowCount) {
		dbLevel.getAll().then((dataDb) => {
			let filter = dataDb.filter(value => findLevel({
				column_count: columnCount,
				row_count: rowCount
			}, value));
			var html = '';
			let column = 5;
			let row = 4;
			let groupCount = (column * row);

			let count = Math.round(filter.length / groupCount);
			let sisa = Math.round(filter.length - (count * groupCount));
			var groups = (count > 0) ? (count + ((sisa > 0) ? 1 : 0)) : ((sisa > 0) ? 1 : 0);
			groups = (groups === 0) ? 1 : groups;

			for (let ig = 0; ig < groups; ig++) {
				html += '<div class="grid">';
				for (let ri = 0; ri < row; ri++) {
					for (let ci = 0; ci < column; ci++) {
						const index = ((ig * (column * row)) + (ri * column)) + ci;
						if (index < filter.length) {
							const value = filter[index];
							html += `<div class="button icon large">
					<span data-id="${value.id}">${value.data.level}</span>
					</div>`;
						} else if (index === filter.length) {
							let c = filter[index - 1];
							let id = (c) ? (c.data.level + 1) : 1
							html += `<div class="button icon large accent" id="add-level" data-next="${id}">
					<span title="Tambah level"><i class="fa fa-plus"></i></span>
					</div>`;
						} else {
							html += '<div class="item-empty"></div>'
						}
					}
				}
				html += '</div>';
			}
			var id = columnCount + 'x' + rowCount + '';
			$('#' + id).html(html);

			var data = dataDb[dataDb.length - 1];
			var item = $('span[data-id=' + (data.id) + ']').parent();
			item.addClass('active');
		});
	}

	function create(level, columnCount, rowCount, callback) {
		dbCategory.find({
			'row_count': rowCount,
			'column_count': columnCount
		}, (value) => {
			if (value) {
				dbLevel.insert({
					'level': level,
					'row_count': rowCount,
					'column_count': columnCount,
					'tsilang': []
				}).then(callback);
			}
		});
	}

	function parseToKotlin(data, options) {
		let packageName = options.packageName;
		let path = 'data.soal'
		let className = options.className;
		let methodName = 'soal' + options.category;

		var classText = 'package ' + packageName + '.' + path;
		classText += '\n\n/**\n*Generated by Tsilang Editor\n*' + Date() + '\n*Cumacoding.com\n*/\n\n';
		classText += 'class ' + className + ' {\n';
		classText += '\tcompanion object {\n';
		classText += '\t\tval ' + methodName + ' = arrayOf(\n';
		var d = [];
		d.sort((a, b) => b.level - a.level);
		data.forEach((result, index) => {
			const value = result.data;
			classText += '\t\t\tarrayOf(\n';
			value.tsilang.forEach((v, i) => {
				classText += `\t\t\t\tarrayOf("${v.answer}", "${v.question}", ${v.column}, ${v.row}, "${v.orientation}")`;
				if (i < value.tsilang.length - 1) {
					classText += ',';
				}
				classText += '\n';
			});
			classText += '\t\t\t)';
			if (index < data.length - 1) {
				classText += ',';
			}
			classText += '\n';
		});
		classText += '\t\t)\n\t}\n}';

		return classText;
	}

	function parseToJava(data, options) {
		let packageName = options.packageName;
		let path = 'data.soal'
		let className = options.className;
		let methodName = 'soal' + options.category;

		var classText = 'package ' + packageName + '.' + path + ';';
		classText += '\n\n/**\n*Generated by Tsilang Editor\n*' + Date() + '\n*Cumacoding.com\n*/\n\n';
		classText += 'public class ' + className + ' {\n';
		classText += '\tpublic static Object[][][] ' + methodName + ' = {\n';
		data.forEach((result, index) => {
			const value = result.data;
			classText += '\t\t{\n';
			value.tsilang.forEach((v, i) => {
				classText += `\t\t\t{"${v.answer}", "${v.question}", ${v.column}, ${v.row}, "${v.orientation}"}`;
				if (i < value.tsilang.length - 1) {
					classText += ',';
				}
				classText += '\n';
			});
			classText += '\t\t}';
			if (index < data.length - 1) {
				classText += ',';
			}
			classText += '\n';
		});
		classText += '\t};\n}';

		return classText;
	}

	function parseToJson(data, ops) {
		const arr = [];
		data.forEach((value) => {
			arr.push(value.data);
		});

		if (typeof ops.noLineSpace === "boolean" && ops.noLineSpace) {
			return JSON.stringify(arr);
		} else {
			return JSON.stringify(arr, undefined, 2);
		}
	}

	function parseJavaToArray(data) {
	}

	function parseKotlinToArray(params) {

	}

	function download(filename, text) {
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', filename);
		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	}

	function parse(id, data, callback) {
		const type = [{
			'extesion': 'kt',
			'type': 'kotlin'
		}, {
			'extesion': 'java',
			'type': 'java'
		}, {
			'extesion': 'json',
			'type': 'json'
		}];
		let t = type.find(value => value.type === data.type);
		dbCategory.get(id).then((r) => {
			if (r) {
				const c = {
					'packageName': (data.package_name !== '') ? data.package_name : 'com.jumadi.tekatekisilang',
					'category': r.data.column_count + 'x' + r.data.row_count,
					'className': (data.class_name !== '') ? data.class_name : 'Soal'
				};
				dbLevel.getAll().then((result) => {
					const filter = result.filter((value) => findCategory(value.data, r));
					let perCountFile = (data.perCountFile > 0) ? data.perCountFile : filter.length;

					let count = Math.round(filter.length / perCountFile);
					let sisa = Math.round(filter.length - (count * perCountFile));

					let j = (count > 0) ? (count + ((sisa > 0) ? 1 : 0)) : ((sisa > 0) ? 1 : 0);

					let strings = [];

					for (let i = 0; i < j; i++) {
						let from = (i * perCountFile);
						let to = ((i + 1) * perCountFile);
						let s = (sisa < 0) ? Math.round((count * perCountFile) - filter.length) : sisa;
						let arr = filter.slice(from, ((to > filter.length) ? (from + s) : to));
						console.log(from + ' ' + ((to > filter.length) ? (from + s) : to));

						let o = {
							'packageName': c.packageName,
							'category': c.category,
							'className': c.className + ((i === 0) ? '' : i)
						}

						if (t) {
							switch (t.type) {
								case type[0].type:
									strings.push(parseToKotlin(arr, o));
									break;
								case type[1].type:
									strings.push(parseToJava(arr, o));
									break;
								case type[2].type:
									strings.push(parseToJson(arr, data));
									break;
							}
						}
					}
					callback.apply(null, [strings, t]);
				});
			}
		});
	}

	var tsilang = {
		init: () => {
			loadDb();
		},
		load: async (id) => {
			dbLevel.get(id)
				.then((result) => tts.loads(result.data))
				.catch((e) => {

				});
		},
		remove: removed,
		create: tts.create,
		removeCategory: removeCategory,
		createCategory: createCategory,
		import: function (dataString, fileType, isDuplicate, callback) {
			let data = JSON.parse(dataString);
			data.forEach((value, i) => {
				dbCategory.find({
					'row_count': value.row_count,
					'column_count': value.column_count
				}, (result) => {
					if (result) {
						dbLevel.find(value, (r) => {
							if (r && isDuplicate) {
								dbLevel.update(value, r.id).then(() => {
									if (i === data.length - 1) {
										$('.__tts_tabs_levels').html('<div class="col s12"><ul class="tabs"></ul></div>');
										callback();
										loadDb();
									}
								});
							} else {
								dbLevel.insert(value).then(() => {
									if (i === data.length - 1) {
										$('.__tts_tabs_levels').html('<div class="col s12"><ul class="tabs"></ul></div>');
										callback();
										loadDb();
									}
								});
							}
						});
					} else {
						dbCategory.insert({
							'row_count': value.row_count,
							'column_count': value.column_count
						}).then(() => {
							dbLevel.insert(value).then(() => {
								if (i === data.length - 1) {
									$('.__tts_tabs_levels').html('<div class="col s12"><ul class="tabs"></ul></div>');
									loadDb();
									callback();
								}
							});
						});
					}
				});
			});
		},
		download: async (id, data, callback) => {
			data['noLineSpace'] = true;
			if (data.type !== 'json' && data.perCountFile === -1) {
				data['perCountFile'] = 50
			}
			parse(id, data, (results, t) => {
				results.forEach(result => {
					if (data.type === 'json') {
						download(data.class_name + '.' + t.extesion, result);
					} else {
						download(data.class_name + '.' + t.extesion, result);
					}
				});
				callback();
			})
		},
		preview: async (id, data, callback) => {
			parse(id, data, (results) => {
				callback.apply(null, [results])
			})
		},
		setFocus: (id) => {
			dbLevel.get(id).then((value) => {
				if (value) {
					tts.loads(value.data);
					$('.__tts_tabs_levels .grid')
					.find('.button span[data-id="' + id + '"]').parent().addClass('active');
					let category = value.data.column_count + 'x' + value.data.row_count;
					$('.__tts_tabs_levels .tabs').find('a[href="#' + category + '"]').trigger('click');
				}
			});
		}
	};

	$('.__tts_tabs_levels').delegate('.grid .button', 'click', function () {
		$('.__tts_tabs_levels').find('.grid .button').each(function () {
			$(this).removeClass('active');
		});
		var id = $(this).find('span').data('id');
		if (typeof id === "number") {
			$(this).addClass('active');
			dbLevel.get(id).then((value) => {
				tts.loads(value.data);
			});
		}
	});

	$('.__tts_tabs_levels').delegateClick('#add-level', function () {
		var level = parseInt($(this).data('next'));
		var cetegory = $(this).parent().parent().attr('id');
		var frist = $(this).parent().find('.item-empty');
		if (frist.length === 0) {
			var html = '';
			for (let index = 0; index < (5 * 4); index++) {
				html += '<div class="item-empty"></div>';
			}
			$(this).parent().parent().append('<div class="grid">' + html + '</div>');
			var frist = $(this).parent().parent().find('.item-empty');
		}
		frist[0].outerHTML = $(this)
			.css('transform', 'scaleX(1) scaleY(1)')
			.attr('data-next', (level + 1))[0].outerHTML;

		if (typeof cetegory !== "undefined") {
			var s = cetegory.split("x");
			create(level, parseInt(s[0]), parseInt(s[1]), () => {
				dbLevel.find({
					'level': level,
					'row_count': parseInt(s[0]),
					'column_count': parseInt(s[1]),
				}, (value) => {
					if (value) {
						$(this)
							.removeClass('accent')
							.addClass('active')
							.removeAttr('data-next')
							.removeAttr('id')
							.removeAttr('style')
							.html(`<span data-id="${value.id}">${level}</span>`);
					}
				});
			});
		}

	});
	return tsilang;
}