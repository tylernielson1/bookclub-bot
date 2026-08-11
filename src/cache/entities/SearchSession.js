class SearchSession {
	constructor(userId, books, query) {
		this.userId = userId;
		this.books = books;
		this.query = query;
		this.page = 0;
		this.pageSize = 5;
		this.selectedBook = null;
	}

	get totalPages() {
		return Math.max(
			1,
			Math.ceil(this.books.length / this.pageSize),
		);
	}

	get currentPage() {
		const start = this.page * this.pageSize;
		return this.books.slice(
			start,
			start + this.pageSize,
		);
	}

	nextPage() {
		if (this.page < this.totalPages - 1) this.page++;
	}

	previousPage() {
		if (this.page > 0) this.page--;
	}

	select(index) {
		const start = this.page * this.pageSize;

		this.selectedBook = this.books[start + index];

		return this.selectedBook;
	}

	toJSON() {
		return {
			userId: this.userId,
			books: this.books,
			query: this.query,
			page: this.page,
			pageSize: this.pageSize,
			selectedBook: this.selectedBook,
		};
	}

	static fromJSON(data) {
		const session = new SearchSession(
			data.userId,
			data.books,
			data.query,
		);

		session.page = data.page;
		session.pageSize = data.pageSize;
		session.selectedBook = data.selectedBook;

		return session;
	}
}

module.exports = SearchSession;